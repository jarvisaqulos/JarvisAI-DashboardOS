const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'rSCy45jxNeuvjsxuOKbl';

// ============================================
// VOICE AGENT SESSION
// Each user gets their own agent session like Slack/Telegram
// ============================================

class VoiceAgentSession {
    constructor(userId) {
        this.userId = userId;
        this.sessionId = `voice_${userId}_${Date.now()}`;
        this.messages = [];
        this.agentProcess = null;
        this.pendingResponse = null;
        this.isProcessing = false;
    }

    async sendToAgent(message) {
        // Spawn a fresh agent subprocess for this request
        return new Promise((resolve, reject) => {
            this.isProcessing = true;
            
            const agent = spawn('openclaw', [
                'sessions', 'spawn',
                '--agent', 'main',
                '--message', JSON.stringify({
                    context: this.getContext(),
                    message: message,
                    sessionId: this.sessionId
                }),
                '--timeout', '120'
            ], {
                cwd: process.env.HOME,
                env: { ...process.env, GOG_KEYRING_PASSWORD: 'openclaw' }
            });

            let output = '';
            let error = '';

            agent.stdout.on('data', (data) => {
                output += data.toString();
            });

            agent.stderr.on('data', (data) => {
                error += data.toString();
            });

            agent.on('close', (code) => {
                this.isProcessing = false;
                
                // Extract response from agent output
                const response = this.extractResponse(output);
                this.messages.push({ role: 'assistant', content: response });
                
                resolve(response);
            });

            // Timeout after 2 minutes
            setTimeout(() => {
                if (this.isProcessing) {
                    agent.kill();
                    this.isProcessing = false;
                    resolve("I'm still working on that. It might take a bit longer.");
                }
            }, 120000);
        });
    }

    getContext() {
        // Return last 10 messages for context
        return this.messages.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n');
    }

    extractResponse(output) {
        // Extract the actual response from agent output
        const lines = output.split('\n');
        const responseLines = [];
        let inResponse = false;
        
        for (const line of lines) {
            if (line.includes('Findings:')) {
                inResponse = true;
                continue;
            }
            if (inResponse && line.trim() && !line.startsWith('Stats:')) {
                responseLines.push(line);
            }
        }
        
        return responseLines.join('\n').trim() || output.trim() || "I processed your request.";
    }

    addMessage(role, content) {
        this.messages.push({ role, content, timestamp: new Date().toISOString() });
    }
}

// Store active sessions
const sessions = new Map();

// ============================================
// EXPRESS SETUP
// ============================================

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use(express.static(__dirname));
app.use(express.json({ limit: '50mb' }));

// ============================================
// MAIN CHAT - Interactive Agent Mode
// ============================================

app.post('/api/chat', async (req, res) => {
    const { message, userId = 'kris' } = req.body;
    
    if (!message) {
        return res.json({ text: "I didn't hear that. Can you repeat?", timestamp: new Date().toISOString() });
    }

    // Get or create session
    if (!sessions.has(userId)) {
        sessions.set(userId, new VoiceAgentSession(userId));
    }
    const session = sessions.get(userId);

    // Add user message
    session.addMessage('user', message);

    try {
        // Send to agent and wait for response
        const response = await session.sendToAgent(message);
        
        return res.json({
            text: response,
            timestamp: new Date().toISOString(),
            source: 'agent'
        });
        
    } catch (err) {
        console.error('Agent error:', err);
        return res.json({
            text: "I'm having trouble processing that. Let me try a different approach.",
            timestamp: new Date().toISOString()
        });
    }
});

// Get conversation history
app.get('/api/history/:userId', (req, res) => {
    const { userId } = req.params;
    const session = sessions.get(userId);
    if (session) {
        res.json({ messages: session.messages });
    } else {
        res.json({ messages: [] });
    }
});

// Clear session
app.post('/api/clear/:userId', (req, res) => {
    const { userId } = req.params;
    sessions.delete(userId);
    res.json({ cleared: true });
});

// ============================================
// TTS ENDPOINT
// ============================================

app.post('/api/tts', (req, res) => {
    if (!ELEVENLABS_API_KEY) {
        return res.status(500).json({ error: 'TTS not configured' });
    }
    
    const { text, voiceId = ELEVENLABS_VOICE_ID } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required' });

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
            return res.status(500).json({ error: 'TTS failed' });
        }
        res.setHeader('Content-Type', 'audio/mpeg');
        ttsRes.pipe(res);
    });

    ttsReq.on('error', () => res.status(500).json({ error: 'TTS error' }));
    ttsReq.write(JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
    }));
    ttsReq.end();
});

// ============================================
// STATIC FILES
// ============================================

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/voice', (req, res) => res.sendFile(path.join(__dirname, 'voice.html')));

// ============================================
// START SERVER
// ============================================

const certPath = path.join(__dirname, 'certs', 'localhost.crt');
const keyPath = path.join(__dirname, 'certs', 'localhost.key');
const hasSSL = fs.existsSync(certPath) && fs.existsSync(keyPath);

if (hasSSL) {
    https.createServer({
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
    }, app).listen(HTTPS_PORT, () => {
        console.log(`🔒 Voice Agent HTTPS: https://localhost:${HTTPS_PORT}/voice`);
    });
}

app.listen(PORT, () => {
    console.log(`🎙️  Voice Agent HTTP: http://localhost:${PORT}/voice`);
});

console.log('🤖 Interactive Voice Agent - Ready for complex tasks');