const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'rSCy45jxNeuvjsxuOKbl';
const GATEWAY_TOKEN = 'ac8d1303479b4f4ffd8511591955e10326cb281a650fe57867c9f2213d9ac9d5';

// Store responses from agent
const agentResponses = new Map();

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
// AGENT WEBHOOK - Receives responses from AI agent
// ============================================

app.post('/api/agent-response', (req, res) => {
    const { requestId, response } = req.body;
    console.log('Agent response:', requestId, response?.substring(0, 100));
    
    if (requestId) {
        agentResponses.set(requestId, {
            text: response,
            timestamp: Date.now()
        });
    }
    
    res.json({ success: true });
});

// ============================================
// MAIN CHAT - Routes to jarvis-voice-chat agent
// ============================================

app.post('/api/chat', async (req, res) => {
    const { message, userId = 'kris' } = req.body;
    
    if (!message) {
        return res.json({ text: "I didn't catch that.", timestamp: new Date().toISOString() });
    }

    const requestId = 'voice_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();

    try {
        // Send to jarvis-voice-chat agent via OpenClaw gateway
        const agentReq = http.request({
            hostname: '127.0.0.1',
            port: 18789,
            path: '/v1/sessions/send',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GATEWAY_TOKEN}`
            }
        }, (agentRes) => {
            let data = '';
            agentRes.on('data', chunk => data += chunk);
            agentRes.on('end', () => {
                console.log('Agent request sent:', requestId);
            });
        });

        agentReq.on('error', (err) => {
            console.error('Agent error:', err);
        });

        // Send message with webhook callback instruction
        agentReq.write(JSON.stringify({
            label: 'jarvis-voice-chat',
            message: `Kris says: "${message}"\n\nRespond conversationally. When done, send your response to:\nPOST http://localhost:${PORT}/api/agent-response\nBody: {"requestId": "${requestId}", "response": "your response here"}`,
            timeoutSeconds: 60
        }));
        agentReq.end();

        // Wait for agent response (up to 60 seconds)
        const responsePromise = new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (agentResponses.has(requestId)) {
                    clearInterval(checkInterval);
                    const resp = agentResponses.get(requestId);
                    agentResponses.delete(requestId);
                    resolve(resp.text);
                }
            }, 500);

            setTimeout(() => {
                clearInterval(checkInterval);
                if (agentResponses.has(requestId)) {
                    const resp = agentResponses.get(requestId);
                    agentResponses.delete(requestId);
                    resolve(resp.text);
                } else {
                    resolve("I'm working on that. Give me a moment to complete it.");
                }
            }, 60000);
        });

        const agentText = await responsePromise;
        
        return res.json({
            text: agentText,
            timestamp: new Date().toISOString(),
            source: 'voice-agent'
        });

    } catch (err) {
        console.error('Chat error:', err);
        return res.json({
            text: "I'm having trouble connecting. Let me try again.",
            timestamp
        });
    }
});

// ============================================
// TTS
// ============================================

app.post('/api/tts', (req, res) => {
    if (!ELEVENLABS_API_KEY) return res.status(500).json({ error: 'TTS not configured' });
    
    const { text, voiceId = ELEVENLABS_VOICE_ID } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required' });

    const options = {
        hostname: 'api.elevenlabs.io', port: 443,
        path: `/v1/text-to-speech/${voiceId}/stream`,
        method: 'POST',
        headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY
        }
    };

    const ttsReq = https.request(options, (ttsRes) => {
        if (ttsRes.statusCode !== 200) return res.status(500).json({ error: 'TTS failed' });
        res.setHeader('Content-Type', 'audio/mpeg');
        ttsRes.pipe(res);
    });

    ttsReq.on('error', () => res.status(500).json({ error: 'TTS error' }));
    ttsReq.write(JSON.stringify({ text, model_id: 'eleven_turbo_v2' }));
    ttsReq.end();
});

// Static
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/voice', (req, res) => res.sendFile(path.join(__dirname, 'voice.html')));

// Start
const certPath = path.join(__dirname, 'certs', 'localhost.crt');
const keyPath = path.join(__dirname, 'certs', 'localhost.key');
const hasSSL = fs.existsSync(certPath) && fs.existsSync(keyPath);

if (hasSSL) {
    https.createServer({ key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }, app)
        .listen(HTTPS_PORT, () => console.log(`🔒 https://localhost:${HTTPS_PORT}/voice`));
}

app.listen(PORT, () => console.log(`🎙️  http://localhost:${PORT}/voice`));

console.log('🤖 Voice Agent Server - Connected to jarvis-voice-chat');