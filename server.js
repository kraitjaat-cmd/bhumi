import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { ConversationManager } from './src/engine/conversationManager.js';
import profile from './src/persona/profile.json' with { type: 'json' };

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const convManager = new ConversationManager();

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId = 'web-session', options = {} } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await convManager.processMessage(sessionId, message, options);
    return res.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Profile & Memory API endpoint
app.get('/api/profile', (req, res) => {
  res.json(profile);
});

// Mood Status endpoint
app.get('/api/mood/:sessionId?', (req, res) => {
  const sessionId = req.params.sessionId || 'web-session';
  const session = convManager.getSession(sessionId);
  res.json({
    mood: session.moodTracker.getMoodLabel(),
    moodState: session.moodTracker.currentMood,
    energy: session.moodTracker.energyLevel,
    sleepiness: session.moodTracker.sleepiness,
    playfulness: session.moodTracker.playfulness
  });
});

// Session history endpoint
app.get('/api/history/:sessionId?', (req, res) => {
  const sessionId = req.params.sessionId || 'web-session';
  res.json({ history: convManager.getHistory(sessionId) });
});

// Clear history endpoint
app.post('/api/clear', (req, res) => {
  const { sessionId = 'web-session' } = req.body;
  convManager.clearSession(sessionId);
  res.json({ success: true, message: 'Chat history cleared' });
});

// Update runtime API Keys endpoint (allows setting key from UI without server restart)
app.post('/api/config', (req, res) => {
  const { anthropicKey, openaiKey, geminiKey, ollamaUrl } = req.body;
  if (anthropicKey) process.env.ANTHROPIC_API_KEY = anthropicKey;
  if (openaiKey) process.env.OPENAI_API_KEY = openaiKey;
  if (geminiKey) process.env.GEMINI_API_KEY = geminiKey;
  if (ollamaUrl) process.env.OLLAMA_BASE_URL = ollamaUrl;
  res.json({
    success: true,
    activeProvider: convManager.llmProvider.getProviderType()
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🌸 BhumiAI Server running at: http://localhost:${PORT}`);
  console.log(`💬 Provider: ${convManager.llmProvider.getProviderType()}`);
  console.log(`======================================================\n`);
});
