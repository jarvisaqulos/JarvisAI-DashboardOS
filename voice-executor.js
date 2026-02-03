const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// Store pending voice requests
const pendingRequests = new Map();

// Voice Agent Process
let voiceAgentProcess = null;

function startVoiceAgent() {
    console.log('🎙️  Starting persistent Voice Agent...');
    
    // Spawn OpenClaw CLI as a persistent agent
    voiceAgentProcess = spawn('openclaw', ['sessions', 'spawn', '--agent', 'main', '--label', 'voice-agent-persistent'], {
        cwd: process.env.HOME,
        env: { ...process.env, GOG_KEYRING_PASSWORD: 'openclaw' }
    });
    
    voiceAgentProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('Voice Agent:', output);
        
        // Check if this is a response to a pending request
        for (const [requestId, resolver] of pendingRequests) {
            if (output.includes('Findings:') || output.length > 50) {
                resolver({ text: extractResponse(output), source: 'voice-agent' });
                pendingRequests.delete(requestId);
                break;
            }
        }
    });
    
    voiceAgentProcess.stderr.on('data', (data) => {
        console.error('Voice Agent Error:', data.toString());
    });
    
    voiceAgentProcess.on('close', (code) => {
        console.log(`Voice Agent exited with code ${code}, restarting...`);
        setTimeout(startVoiceAgent, 5000);
    });
    
    console.log('✅ Voice Agent started');
}

function extractResponse(output) {
    // Extract the meaningful response from agent output
    const lines = output.split('\n');
    const findingsIndex = lines.findIndex(l => l.includes('Findings:'));
    if (findingsIndex >= 0) {
        return lines.slice(findingsIndex + 1).join(' ').trim();
    }
    return output.trim();
}

// API endpoint for voice commands
app.post('/voice-command', async (req, res) => {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: 'Message required' });
    }
    
    console.log('🎤 Voice command:', message);
    
    // Create a request ID
    const requestId = Date.now().toString();
    
    // Set up promise to wait for response
    const responsePromise = new Promise((resolve) => {
        pendingRequests.set(requestId, resolve);
        
        // Timeout after 30 seconds
        setTimeout(() => {
            if (pendingRequests.has(requestId)) {
                resolve({ text: 'I\'m processing that, but it\'s taking a moment. Let me get back to you.', source: 'timeout' });
                pendingRequests.delete(requestId);
            }
        }, 30000);
    });
    
    // Send to voice agent via sessions_send
    const taskDescription = buildTaskPrompt(message);
    
    // For now, execute tasks directly
    const result = await executeVoiceTask(message);
    
    res.json({
        text: result,
        timestamp: new Date().toISOString(),
        source: 'voice-executor'
    });
});

async function executeVoiceTask(message) {
    const lowerMsg = message.toLowerCase();
    
    // TASK CREATION
    if (lowerMsg.includes('add task') || lowerMsg.includes('create task') || lowerMsg.includes('new task')) {
        const title = message.replace(/(add|create|new) task[:\s]*/i, '').trim();
        if (title) {
            return createTask(title);
        }
    }
    
    // TASK UPDATE
    if (lowerMsg.includes('mark task') || lowerMsg.includes('complete task') || lowerMsg.includes('finish task')) {
        const taskName = message.replace(/.*(mark|complete|finish) task[:\s]*/i, '').trim();
        return updateTaskStatus(taskName, 'completed');
    }
    
    // PROJECT UPDATE
    if (lowerMsg.includes('update project') || lowerMsg.includes('project progress')) {
        const projectMatch = message.match(/(thinknlocal|aqulos|ph ventures|philippine)/i);
        if (projectMatch) {
            const projectId = projectMatch[1].toLowerCase().replace(' ', '-');
            return updateProjectProgress(projectId);
        }
    }
    
    // EMAIL ACTIONS
    if (lowerMsg.includes('mark email') || lowerMsg.includes('archive email')) {
        return 'I can\'t archive emails yet, but I can read them to you. Which one would you like me to summarize?';
    }
    
    // CALENDAR ACTIONS
    if (lowerMsg.includes('add event') || lowerMsg.includes('schedule meeting')) {
        return 'I can check your calendar, but adding events requires calendar write access. Want me to help you set that up?';
    }
    
    // WORK LOG
    if (lowerMsg.includes('log work') || lowerMsg.includes('add to work log')) {
        const entry = message.replace(/.*(log work|add to work log)[:\s]*/i, '').trim();
        return addWorkLog(entry || message);
    }
    
    // FALLBACK - Use the smart responses from the main server
    return null; // Let main server handle
}

function buildTaskPrompt(message) {
    return `Execute voice command: "${message}"

You have access to:
1. Read/update dashboard data at /home/kjcardona/.openclaw/workspace/jarvis-dashboard/data/dashboard-data.json
2. Check Gmail via gog cli
3. Check calendar via gog cli

If the user wants to:
- Add a task → Create it in dashboard-data.json tasks array
- Update a project → Modify the project progress/current fields
- Check emails → Use gog gmail
- Check calendar → Use gog calendar

Be concise. Execute the task and report back what you did.`;
}

// Task management functions
function createTask(title) {
    const dataPath = path.join(__dirname, '..', 'jarvis-dashboard', 'data', 'dashboard-data.json');
    let data = { tasks: [], projects: [], workLog: [] };
    
    if (fs.existsSync(dataPath)) {
        data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
    
    const newTask = {
        id: Date.now().toString(),
        title,
        description: 'Created via voice',
        status: 'pending',
        priority: 'medium',
        assignee: 'Jarvis',
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    };
    
    data.tasks = data.tasks || [];
    data.tasks.unshift(newTask);
    
    data.workLog = data.workLog || [];
    data.workLog.unshift({
        id: Date.now().toString(),
        text: `Voice: Created task "${title}"`,
        type: 'task',
        timestamp: new Date().toISOString()
    });
    
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    
    return `Created task: "${title}". It's in your pending tasks now. Want me to mark it as in-progress?`;
}

function updateTaskStatus(taskName, status) {
    const dataPath = path.join(__dirname, '..', 'jarvis-dashboard', 'data', 'dashboard-data.json');
    if (!fs.existsSync(dataPath)) return 'No tasks found.';
    
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const tasks = data.tasks || [];
    
    // Find matching task
    const task = tasks.find(t => 
        t.title.toLowerCase().includes(taskName.toLowerCase()) ||
        taskName.toLowerCase().includes(t.title.toLowerCase())
    );
    
    if (task) {
        task.status = status;
        task.updated = new Date().toISOString();
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        return `Marked "${task.title}" as ${status}.`;
    }
    
    return `I couldn't find a task matching "${taskName}". Your current tasks are: ${tasks.slice(0, 3).map(t => t.title).join(', ')}`;
}

function updateProjectProgress(projectId) {
    const dataPath = path.join(__dirname, '..', 'jarvis-dashboard', 'data', 'dashboard-data.json');
    if (!fs.existsSync(dataPath)) return 'No projects found.';
    
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const projects = data.projects || [];
    
    const project = projects.find(p => 
        p.id.includes(projectId) || 
        p.name.toLowerCase().includes(projectId)
    );
    
    if (project) {
        return `"${project.name}" is at ${project.progress}% progress. Current status: ${project.current}. Want me to update the progress percentage?`;
    }
    
    return 'Project not found. Available: ' + projects.map(p => p.name).join(', ');
}

function addWorkLog(entry) {
    const dataPath = path.join(__dirname, '..', 'jarvis-dashboard', 'data', 'dashboard-data.json');
    let data = { tasks: [], projects: [], workLog: [] };
    
    if (fs.existsSync(dataPath)) {
        data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
    
    data.workLog = data.workLog || [];
    data.workLog.unshift({
        id: Date.now().toString(),
        text: entry,
        type: 'voice',
        timestamp: new Date().toISOString()
    });
    
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    
    return `Logged: "${entry}" to your work log.`;
}

const PORT = 3005;
app.listen(PORT, () => {
    console.log(`🎯 Voice Task Executor running on port ${PORT}`);
    // startVoiceAgent();
});

module.exports = { executeVoiceTask };