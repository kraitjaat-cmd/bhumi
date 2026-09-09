import { MoodTracker } from './moodTracker.js';
import { LLMProvider } from './llmProvider.js';

export class ConversationManager {
  constructor() {
    this.sessions = new Map();
    this.llmProvider = new LLMProvider();
  }

  getSession(sessionId = 'default') {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        id: sessionId,
        messages: [],
        moodTracker: new MoodTracker(),
        createdAt: new Date().toISOString()
      });
    }
    return this.sessions.get(sessionId);
  }

  async processMessage(sessionId = 'default', userText, options = {}) {
    const session = this.getSession(sessionId);

    // 1. Update mood tracking
    const moodState = session.moodTracker.updateMood(userText);

    // 2. Append user message
    session.messages.push({
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString()
    });

    // 3. Keep sliding window (last 20 messages for context)
    const contextWindow = session.messages.slice(-20);

    // 4. Generate reply via LLM or simulated engine
    const replyText = await this.llmProvider.generateReply({
      messages: contextWindow,
      moodInfo: moodState,
      options
    });

    // 5. Append assistant reply
    session.messages.push({
      role: 'assistant',
      content: replyText,
      timestamp: new Date().toISOString()
    });

    return {
      reply: replyText,
      mood: session.moodTracker.getMoodLabel(),
      moodData: moodState,
      provider: this.llmProvider.getProviderType(),
      messageCount: session.messages.length
    };
  }

  clearSession(sessionId = 'default') {
    if (this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId);
      session.messages = [];
      session.moodTracker = new MoodTracker();
      return true;
    }
    return false;
  }

  getHistory(sessionId = 'default') {
    const session = this.getSession(sessionId);
    return session.messages;
  }
}
