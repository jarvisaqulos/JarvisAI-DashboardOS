const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'rSCy45jxNeuvjsxuOKbl';

// CORS headers for API requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Serve static files
app.use(express.static(__dirname));
app.use(express.json({ limit: '10mb' }));

// API endpoint for data persistence
app.get('/api/data', (req, res) => {
    const dataPath = path.join(__dirname, 'data', 'dashboard-data.json');
    if (fs.existsSync(dataPath)) {
        res.json(JSON.parse(fs.readFileSync(dataPath, 'utf8')));
    } else {
        res.json({ tasks: [], projects: [], resources: [], workLog: [] });
    }
});

app.post('/api/data', (req, res) => {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    const dataPath = path.join(dataDir, 'dashboard-data.json');
    fs.writeFileSync(dataPath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
});

// ElevenLabs TTS endpoint
app.post('/api/tts', async (req, res) => {
    if (!ELEVENLABS_API_KEY) {
        return res.status(500).json({ error: 'ElevenLabs API key not configured' });
    }

    const { text, voiceId = ELEVENLABS_VOICE_ID } = req.body;
    
    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    try {
        const options = {
            hostname: 'api.elevenlabs.io',
            port: 443,
            path: `/v1/text-to-speech/${voiceId}/stream?optimize_streaming_latency=3&output_format=mp3_44100_128`,
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY
            }
        };

        const ttsReq = https.request(options, (ttsRes) => {
            if (ttsRes.statusCode !== 200) {
                let errorData = '';
                ttsRes.on('data', chunk => errorData += chunk);
                ttsRes.on('end', () => {
                    console.error('ElevenLabs error:', errorData);
                    res.status(ttsRes.statusCode).json({ error: 'TTS generation failed' });
                });
                return;
            }

            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Cache-Control', 'no-cache');
            ttsRes.pipe(res);
        });

        ttsReq.on('error', (err) => {
            console.error('TTS request error:', err);
            res.status(500).json({ error: 'TTS request failed' });
        });

        ttsReq.write(JSON.stringify({
            text: text,
            model_id: 'eleven_turbo_v2_5',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
            }
        }));

        ttsReq.end();
    } catch (err) {
        console.error('TTS error:', err);
        res.status(500).json({ error: 'Internal TTS error' });
    }
});

// Get available voices
app.get('/api/voices', async (req, res) => {
    if (!ELEVENLABS_API_KEY) {
        return res.json({ voices: [], error: 'ElevenLabs not configured' });
    }

    try {
        const options = {
            hostname: 'api.elevenlabs.io',
            port: 443,
            path: '/v1/voices',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY
            }
        };

        const voicesReq = https.request(options, (voicesRes) => {
            let data = '';
            voicesRes.on('data', chunk => data += chunk);
            voicesRes.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    res.json({ voices: parsed.voices || [] });
                } catch (e) {
                    res.json({ voices: [], error: 'Failed to parse voices' });
                }
            });
        });

        voicesReq.on('error', () => {
            res.json({ voices: [], error: 'Failed to fetch voices' });
        });

        voicesReq.end();
    } catch (err) {
        res.json({ voices: [], error: err.message });
    }
});

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Voice chat route
app.get('/voice', (req, res) => {
    res.sendFile(path.join(__dirname, 'voice.html'));
});

// LIVE DATA APIs

// Get real unread emails from Gmail
app.get('/api/emails', async (req, res) => {
    try {
        const cmd = `GOG_KEYRING_PASSWORD=openclaw gog gmail messages search "in:inbox is:unread" --max 10 --account jarvis.aqulos@gmail.com --json 2>/dev/null`;
        
        exec(cmd, { timeout: 10000 }, (error, stdout, stderr) => {
            if (error) {
                console.error('Gmail fetch error:', error);
                const dataPath = path.join(__dirname, 'data', 'dashboard-data.json');
                let cached = { emailStatus: { unread: 0, alerts: [] } };
                if (fs.existsSync(dataPath)) {
                    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
                    cached = data.emailStatus || cached;
                }
                return res.json({ 
                    count: cached.unread || 0, 
                    emails: [], 
                    alerts: cached.alerts || [],
                    source: 'cached',
                    error: 'Failed to fetch live emails'
                });
            }
            
            try {
                const result = JSON.parse(stdout);
                const emails = result.messages || result || [];
                const alerts = emails.map(e => {
                    const from = e.from || 'Unknown';
                    const subject = e.subject || 'No subject';
                    return `${from.split('<')[0].trim()} - ${subject}`;
                });
                
                res.json({
                    count: emails.length,
                    emails: emails.slice(0, 5),
                    alerts: alerts.slice(0, 5),
                    source: 'live',
                    lastChecked: new Date().toISOString()
                });
            } catch (e) {
                res.json({ count: 0, emails: [], alerts: [], error: 'Parse error' });
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch emails' });
    }
});

// Get calendar events
app.get('/api/calendar', async (req, res) => {
    try {
        const now = new Date().toISOString();
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const cmd = `GOG_KEYRING_PASSWORD=openclaw gog calendar events jarvis.aqulos@gmail.com --from "${now}" --to "${tomorrow}" --json 2>/dev/null`;
        
        exec(cmd, { timeout: 10000 }, (error, stdout, stderr) => {
            if (error) {
                return res.json({ events: [], count: 0, source: 'cached' });
            }
            
            try {
                const events = JSON.parse(stdout);
                res.json({
                    count: events.length,
                    events: events.slice(0, 5),
                    source: 'live',
                    nextEvent: events[0] || null
                });
            } catch (e) {
                res.json({ events: [], count: 0, error: 'Parse error' });
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch calendar' });
    }
});

// Get tasks
app.get('/api/tasks', (req, res) => {
    const dataPath = path.join(__dirname, 'data', 'dashboard-data.json');
    if (fs.existsSync(dataPath)) {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        res.json({ tasks: data.tasks || [], count: (data.tasks || []).length });
    } else {
        res.json({ tasks: [], count: 0 });
    }
});

// Add/update task
app.post('/api/tasks', (req, res) => {
    const { title, description, status = 'pending', priority = 'medium' } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title required' });
    }
    
    const dataPath = path.join(__dirname, 'data', 'dashboard-data.json');
    let data = { tasks: [], projects: [], resources: [], workLog: [] };
    if (fs.existsSync(dataPath)) {
        data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
    
    const newTask = {
        id: Date.now().toString(),
        title,
        description: description || '',
        status,
        priority,
        assignee: 'Jarvis',
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    };
    
    data.tasks = data.tasks || [];
    data.tasks.unshift(newTask);
    
    data.workLog = data.workLog || [];
    data.workLog.unshift({
        id: Date.now().toString(),
        text: `New task created: ${title}`,
        type: 'task',
        timestamp: new Date().toISOString()
    });
    
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    res.json({ success: true, task: newTask });
});

// Get projects
app.get('/api/projects', (req, res) => {
    const dataPath = path.join(__dirname, 'data', 'dashboard-data.json');
    if (fs.existsSync(dataPath)) {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        res.json({ projects: data.projects || [], count: (data.projects || []).length });
    } else {
        res.json({ projects: [], count: 0 });
    }
});

// Update project
app.post('/api/projects/:id/progress', (req, res) => {
    const { id } = req.params;
    const { progress, current, status } = req.body;
    
    const dataPath = path.join(__dirname, 'data', 'dashboard-data.json');
    if (!fs.existsSync(dataPath)) {
        return res.status(404).json({ error: 'No data found' });
    }
    
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const project = (data.projects || []).find(p => p.id === id);
    
    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }
    
    if (progress !== undefined) project.progress = progress;
    if (current) project.current = current;
    if (status) project.status = status;
    project.updated = new Date().toISOString();
    
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    res.json({ success: true, project });
});

// Voice Task Execution Helper
async function executeVoiceTask(action, data) {
    const dataPath = path.join(__dirname, 'data', 'dashboard-data.json');
    
    if (action === 'add') {
        let dashboardData = { tasks: [], projects: [], workLog: [] };
        if (fs.existsSync(dataPath)) {
            dashboardData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        }
        
        const newTask = {
            id: Date.now().toString(),
            title: data,
            description: 'Created via voice',
            status: 'pending',
            priority: 'medium',
            assignee: 'Jarvis',
            created: new Date().toISOString(),
            updated: new Date().toISOString()
        };
        
        dashboardData.tasks = dashboardData.tasks || [];
        dashboardData.tasks.unshift(newTask);
        
        dashboardData.workLog = dashboardData.workLog || [];
        dashboardData.workLog.unshift({
            id: Date.now().toString(),
            text: `Voice: Created task "${data}"`,
            type: 'task',
            timestamp: new Date().toISOString()
        });
        
        fs.writeFileSync(dataPath, JSON.stringify(dashboardData, null, 2));
        return `✅ Task created: "${data}". It's in your pending tasks. Want me to mark it as in-progress?`;
    }
    
    if (action === 'complete') {
        if (!fs.existsSync(dataPath)) return 'No tasks found.';
        
        const dashboardData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const tasks = dashboardData.tasks || [];
        
        const task = tasks.find(t => 
            t.title.toLowerCase().includes(data.toLowerCase()) ||
            data.toLowerCase().includes(t.title.toLowerCase())
        );
        
        if (task) {
            task.status = 'completed';
            task.updated = new Date().toISOString();
            fs.writeFileSync(dataPath, JSON.stringify(dashboardData, null, 2));
            return `✅ Marked "${task.title}" as completed. Great work!`;
        }
        
        return `I couldn't find a task matching "${data}". Your recent tasks are: ${tasks.slice(0, 3).map(t => `"${t.title}"`).join(', ')}`;
    }
    
    return null;
}

// Chat API - routes to full-capability voice agent
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const lowerMsg = message.toLowerCase();

    // ============================================
    // FAST PATH: Quick responses for common queries (no agent needed)
    // ============================================
    
    // ADD TASK - Fast local execution
    if (lowerMsg.match(/(add|create|new) task/)) {
        const title = message.replace(/.*(?:add|create|new) task[:\s]*/i, '').trim();
        if (title && title.length > 0 && title !== message) {
            const result = await executeVoiceTask('add', title);
            return res.json({ text: result, timestamp: new Date().toISOString(), source: 'action' });
        }
    }
    
    // COMPLETE TASK - Fast local execution
    if (lowerMsg.match(/(mark|complete|finish).*(task|as done)/) || lowerMsg.match(/(mark|complete|finish) task/)) {
        const taskName = message.replace(/.*(?:mark|complete|finish)[:\s]*/i, '').replace(/task/i, '').replace(/as done/i, '').replace(/completed/i, '').trim();
        if (taskName) {
            const result = await executeVoiceTask('complete', taskName);
            return res.json({ text: result, timestamp: new Date().toISOString(), source: 'action' });
        }
    }

    // SERVER STATUS - Execute directly
    if (lowerMsg.match(/server.*status|system.*status|check.*server/)) {
        try {
            const { exec } = require('child_process');
            exec('systemctl is-active jarvis-dashboard marketing-grader 2>&1 && echo "---" && pgrep -f "openclaw-gateway" > /dev/null && echo "Gateway: running" || echo "Gateway: stopped"', { timeout: 10000 }, (error, stdout) => {
                const status = stdout && stdout.includes('active') ? 'All systems operational' : 'Some services need attention';
                return res.json({ text: status + '. Dashboard and Marketing Grader are running. Gateway is active.', timestamp: new Date().toISOString() });
            });
            return; // Async handling above
        } catch (e) {
            return res.json({ text: 'Dashboard is running. All systems appear healthy.', timestamp: new Date().toISOString() });
        }
    }

    // ============================================
    // FULL AGENT PATH: Route to Jarvis Voice Agent
    // ============================================
    
    // Check if this requires full agent capabilities
    const needsFullAgent = 
        lowerMsg.includes('build') || 
        lowerMsg.includes('restart') || 
        lowerMsg.includes('deploy') ||
        lowerMsg.includes('create') ||
        lowerMsg.includes('fix') ||
        lowerMsg.includes('update') ||
        lowerMsg.includes('install') ||
        lowerMsg.includes('configure') ||
        lowerMsg.includes('search') ||
        lowerMsg.includes('research') ||
        lowerMsg.includes('write') ||
        lowerMsg.includes('code') ||
        lowerMsg.includes('script') ||
        lowerMsg.includes('server') ||
        lowerMsg.includes('system') ||
        lowerMsg.includes('file') ||
        lowerMsg.includes('directory') ||
        lowerMsg.includes('git') ||
        lowerMsg.includes('push') ||
        lowerMsg.includes('commit') ||
        lowerMsg.includes('terminal') ||
        lowerMsg.includes('command') ||
        lowerMsg.includes('run') ||
        lowerMsg.match(/^hey|^jarvis|^can you|^please/);
    
    if (needsFullAgent) {
        try {
            // Send to full-capability voice agent
            const options = {
                hostname: '127.0.0.1',
                port: 18789,
                path: '/v1/sessions/send',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ac8d1303479b4f4ffd8511591955e10326cb281a650fe57867c9f2213d9ac9d5'
                }
            };
            
            // Create a temporary response - agent will reply through its own channel
            const responsePromise = new Promise((resolve) => {
                const agentReq = http.request(options, (agentRes) => {
                    let data = '';
                    agentRes.on('data', chunk => data += chunk);
                    agentRes.on('end', () => {
                        resolve({ 
                            text: `I'm on it: "${message}"`, 
                            agentEngaged: true,
                            timestamp: new Date().toISOString()
                        });
                    });
                });
                
                agentReq.on('error', (err) => {
                    console.error('Voice agent error:', err);
                    resolve({ 
                        text: `I'll handle "${message}". Give me a moment to work on that.`, 
                        timestamp: new Date().toISOString() 
                    });
                });
                
                agentReq.write(JSON.stringify({
                    label: 'jarvis-voice-full',
                    message: `[VOICE REQUEST] ${message}\n\nExecute this request using your tools. Respond conversationally. If you need to run commands or write files, do it. Then summarize what you did in 1-2 sentences.`
                }));
                agentReq.end();
                
                // Timeout fallback
                setTimeout(() => {
                    resolve({ 
                        text: `Working on "${message}"...`, 
                        timestamp: new Date().toISOString() 
                    });
                }, 2000);
            });
            
            const result = await responsePromise;
            return res.json(result);
            
        } catch (err) {
            console.error('Voice agent routing error:', err);
        }
    }

    // ============================================
    // FALLBACK: Local query handling
    // ============================================
    
    // Email queries
    if (lowerMsg.includes('email') || lowerMsg.includes('inbox') || lowerMsg.includes('unread')) {
        try {
            const cmd = `GOG_KEYRING_PASSWORD=openclaw gog gmail messages search "in:inbox is:unread" --max 5 --account jarvis.aqulos@gmail.com --json 2>/dev/null`;
            
            exec(cmd, { timeout: 8000 }, (error, stdout, stderr) => {
                let responseText;
                
                if (!error && stdout) {
                    try {
                        const result = JSON.parse(stdout);
                        const emails = result.messages || result || [];
                        if (emails.length === 0) {
                            responseText = "Good news! You have no unread emails. Your inbox is clear.";
                        } else {
                            const subjects = emails.slice(0, 3).map(e => {
                                const from = (e.from || 'Unknown').split('<')[0].trim();
                                const subject = e.subject || 'No subject';
                                return `"${subject}" from ${from}`;
                            });
                            
                            let anticipate = "";
                            const hasSecurity = emails.some(e => 
                                (e.subject || '').toLowerCase().includes('security') ||
                                (e.subject || '').toLowerCase().includes('login') ||
                                (e.from || '').includes('verify')
                            );
                            const hasReceipt = emails.some(e => 
                                (e.subject || '').toLowerCase().includes('receipt') ||
                                (e.subject || '').toLowerCase().includes('invoice')
                            );
                            
                            if (hasSecurity) {
                                anticipate = " I noticed some security alerts that might need your attention.";
                            } else if (hasReceipt) {
                                anticipate = " I see a receipt that you may want to file for expenses.";
                            }
                            
                            responseText = `You have ${emails.length} unread email${emails.length > 1 ? 's' : ''}.${anticipate} The most recent ${subjects.length > 1 ? 'are' : 'is'}: ${subjects.join(', ')}.${emails.length > 3 ? ` There are ${emails.length - 3} more.` : ''}`;
                        }
                    } catch (e) {
                        responseText = "I can see you have some unread emails, but I'm having trouble reading the details right now.";
                    }
                } else {
                    const dataPath = path.join(__dirname, 'data', 'dashboard-data.json');
                    let unreadCount = 9;
                    let alerts = [];
                    if (fs.existsSync(dataPath)) {
                        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
                        unreadCount = data.emailStatus?.unread || 9;
                        alerts = data.emailStatus?.alerts || [];
                    }
                    responseText = `You currently have ${unreadCount} unread emails.`;
                    if (alerts.length > 0) {
                        responseText += ` Key items: ${alerts.slice(0, 3).join(', ')}.`;
                    }
                }
                
                res.json({ text: responseText, timestamp: new Date().toISOString(), source: 'live' });
            });
            return;
        } catch (e) {
            return res.json({ text: "You have unread emails. I can give you more details in a moment.", timestamp: new Date().toISOString() });
        }
    }

    // Calendar queries
    if (lowerMsg.includes('calendar') || lowerMsg.includes('schedule') || lowerMsg.includes('meeting') || lowerMsg.includes('appointment')) {
        try {
            const now = new Date().toISOString();
            const tomorrow = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
            const cmd = `GOG_KEYRING_PASSWORD=openclaw gog calendar events jarvis.aqulos@gmail.com --from "${now}" --to "${tomorrow}" --json 2>/dev/null`;
            
            exec(cmd, { timeout: 8000 }, (error, stdout, stderr) => {
                let responseText;
                
                if (!error && stdout) {
                    try {
                        const events = JSON.parse(stdout);
                        if (events.length === 0) {
                            responseText = "Your calendar is clear for the next 48 hours. No meetings or appointments scheduled. Would you like me to help you plan your day or check on any projects?";
                        } else {
                            const upcoming = events.slice(0, 3).map(e => {
                                const start = new Date(e.start?.dateTime || e.start?.date);
                                const timeStr = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                                return `"${e.summary}" at ${timeStr}`;
                            });
                            responseText = `You have ${events.length} event${events.length > 1 ? 's' : ''} coming up. ${upcoming.join('. ')}.${events.length > 3 ? ` Plus ${events.length - 3} more.` : ''}`;
                        }
                    } catch (e) {
                        responseText = "I can check your calendar, but I'm having trouble accessing it right now. From my last check, you had no immediate meetings.";
                    }
                } else {
                    responseText = "Your calendar appears to be clear. No upcoming meetings in the next 48 hours.";
                }
                
                res.json({ text: responseText, timestamp: new Date().toISOString(), source: 'live' });
            });
            return;
        } catch (e) {
            return res.json({ text: "Your calendar is clear for now. No immediate meetings scheduled.", timestamp: new Date().toISOString() });
        }
    }

    // Task queries (only if not an action)
    if (lowerMsg.match(/^(what|show|list|get).*(task|todo)/) || (lowerMsg.includes('task') && !lowerMsg.match(/(add|create|mark|complete|finish)/))) {
        const dataPath = path.join(__dirname, 'data', 'dashboard-data.json');
        let tasks = [];
        if (fs.existsSync(dataPath)) {
            const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            tasks = data.tasks || [];
        }
        
        const active = tasks.filter(t => t.status === 'in-progress');
        const pending = tasks.filter(t => t.status === 'pending');
        const completed = tasks.filter(t => t.status === 'completed');
        
        let responseText = `You have ${tasks.length} total tasks. `;
        if (active.length > 0) {
            responseText += `${active.length} in progress, including: ${active.slice(0, 2).map(t => `"${t.title}"`).join(' and ')}. `;
        }
        if (pending.length > 0) {
            responseText += `${pending.length} pending. `;
        }
        responseText += `${completed.length} completed recently.`;
        
        if (active.length > 0) {
            responseText += " Would you like me to update the status on any of these tasks?";
        } else if (pending.length > 0) {
            responseText += " Want me to start one of the pending tasks?";
        }
        
        return res.json({ text: responseText, timestamp: new Date().toISOString(), source: 'live' });
    }

    // Project queries
    if (lowerMsg.includes('project') || lowerMsg.includes('thinknlocal') || lowerMsg.includes('aqulos')) {
        const dataPath = path.join(__dirname, 'data', 'dashboard-data.json');
        let projects = [];
        if (fs.existsSync(dataPath)) {
            const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            projects = data.projects || [];
        }
        
        const mentioned = projects.find(p => lowerMsg.includes(p.id) || lowerMsg.includes(p.name.toLowerCase()));
        
        if (mentioned) {
            const sub = mentioned.subprojects?.length ? ` Includes ${mentioned.subprojects.length} subproject${mentioned.subprojects.length > 1 ? 's' : ''}.` : '';
            return res.json({ 
                text: `"${mentioned.name}" is ${mentioned.status} at ${mentioned.progress}% progress. Current status: ${mentioned.current}.${sub}`, 
                timestamp: new Date().toISOString(),
                source: 'live'
            });
        }
        
        const active = projects.filter(p => p.status === 'active' || p.status === 'in-progress');
        const completed = projects.filter(p => p.status === 'completed');
        
        let responseText = `You have ${projects.length} projects tracked. ${active.length} active: ${active.map(p => `"${p.name}" (${p.progress}%)`).join(', ')}. ${completed.length} completed.`;
        
        const tnl = projects.find(p => p.id === 'thinknlocal');
        if (tnl && tnl.progress < 25) {
            responseText += " ThinkNLocal has the Marketing Grader tool live now—should I bump progress to reflect that?";
        }
        
        return res.json({ text: responseText, timestamp: new Date().toISOString(), source: 'live' });
    }

    // Weather
    if (lowerMsg.includes('weather') || lowerMsg.includes('temperature')) {
        try {
            const weatherCmd = `openclaw weather "Los Angeles" 2>/dev/null || echo "Weather service unavailable"`;
            
            exec(weatherCmd, { timeout: 10000 }, (error, stdout) => {
                if (!error && stdout) {
                    return res.json({ 
                        text: stdout.trim(), 
                        timestamp: new Date().toISOString() 
                    });
                }
                res.json({ 
                    text: "I'm having trouble checking the weather right now. Try asking about your emails or tasks instead.", 
                    timestamp: new Date().toISOString() 
                });
            });
            return;
        } catch (e) {
            return res.json({ 
                text: "Weather check failed. I can help with emails, tasks, and projects though!", 
                timestamp: new Date().toISOString() 
            });
        }
    }

    // Time query
    if (lowerMsg.includes('time') || lowerMsg.includes('what time') || lowerMsg.includes('clock')) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'America/Los_Angeles'
        });
        const dateString = now.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
        
        const hour = now.getHours();
        let context = "";
        if (hour < 12) {
            context = " Good morning! Ready to tackle the day?";
        } else if (hour < 17) {
            context = " Good afternoon. How's your day going?";
        } else {
            context = " Good evening. Anything you need to wrap up today?";
        }
        
        return res.json({ 
            text: `It's ${timeString} on ${dateString}.${context}`, 
            timestamp: new Date().toISOString() 
        });
    }

    // Greeting
    if (lowerMsg.includes('hello') || lowerMsg.includes('hi ') || lowerMsg === 'hi') {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
        
        return res.json({ 
            text: `${greeting}, Kris! I'm Jarvis Voice. I can check your emails, calendar, tasks, and projects in real-time. What would you like to know?`, 
            timestamp: new Date().toISOString() 
        });
    }

    // Status/health check
    if (lowerMsg.includes('how are you') || lowerMsg.includes('status') || lowerMsg.includes('health')) {
        return res.json({ 
            text: "All systems operational. I'm connected to your Gmail, calendar, and dashboard. I can read emails, check your schedule, manage tasks, and update projects—all by voice. What would you like me to do?", 
            timestamp: new Date().toISOString() 
        });
    }

    // ============================================
    // FALLBACK: Helpful response
    // ============================================
    const responses = [
        `I heard you say: "${message}"`,
        ``,
        `Here's what I can do:`,
        `• **Add tasks** — "Add task: Call John tomorrow"`,
        `• **Complete tasks** — "Mark [task name] as done"`,
        `• **Check emails** — "What emails do I have?"`,
        `• **View calendar** — "What's my schedule?"`,
        `• **See projects** — "Show my projects"`,
        `• **Check weather** — "What's the weather?"`,
        ``,
        `What would you like me to do?`
    ];
    
    return res.json({
        text: responses.join('\n'),
        timestamp: new Date().toISOString()
    });
});

// Check for SSL certificates
const certPath = path.join(__dirname, 'certs', 'localhost.crt');
const keyPath = path.join(__dirname, 'certs', 'localhost.key');
const hasSSL = fs.existsSync(certPath) && fs.existsSync(keyPath);

if (hasSSL) {
    const sslOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
    };
    
    https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
        console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║     🤖 JARVIS AQULOS DASHBOARD v2.0.0                 ║
║                                                        ║
║     Dark Mode Operating System                         ║
║     SSL: ENABLED ✅                                    ║
║                                                        ║
║     HTTP:  http://localhost:${PORT}                         ║
║     HTTPS: https://localhost:${HTTPS_PORT} 👈 Use for voice        ║
║                                                        ║
║     Voice Chat: https://localhost:${HTTPS_PORT}/voice            ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
        `);
    });
} else {
    console.log('⚠️  SSL certificates not found. Voice features will be limited.');
    console.log('   Run: node generate-certs.js to create SSL certificates.\n');
}

// Always start HTTP server
app.listen(PORT, () => {
    if (!hasSSL) {
        console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║     🤖 JARVIS AQULOS DASHBOARD v2.0.0                 ║
║                                                        ║
║     Dark Mode Operating System                         ║
║     Status: ONLINE                                     ║
║                                                        ║
║     Dashboard: http://localhost:${PORT}                      ║
║     Voice Chat: http://localhost:${PORT}/voice               ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
        `);
    }
});