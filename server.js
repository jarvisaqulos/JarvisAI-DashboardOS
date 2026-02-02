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

// Check for SSL certificates
const certPath = path.join(__dirname, 'certs', 'localhost.crt');
const keyPath = path.join(__dirname, 'certs', 'localhost.key');
const hasSSL = fs.existsSync(certPath) && fs.existsSync(keyPath);

if (hasSSL) {
    // Start HTTPS server for voice/mic access
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
