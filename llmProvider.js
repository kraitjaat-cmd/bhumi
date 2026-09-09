import { generateSystemPrompt, getFewShotMessages } from '../persona/systemPrompt.js';
import { OfflineSimulator } from './offlineSimulator.js';

export class LLMProvider {
  constructor() {
    this.offlineSimulator = new OfflineSimulator();
  }

  getProviderType() {
    if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim().startsWith('sk-ant')) return 'anthropic';
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().startsWith('sk-')) return 'openai';
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 10) return 'gemini';
    if (process.env.USE_OLLAMA === 'true') return 'ollama';
    return 'offline_simulator';
  }

  async generateReply({ messages, moodInfo, options = {} }) {
    const provider = options.providerOverride || this.getProviderType();
    const systemPrompt = generateSystemPrompt({
      currentMood: moodInfo?.mood || 'natural',
      timeContext: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })
    });

    try {
      if (provider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
        return await this._callAnthropic(systemPrompt, messages, options);
      } else if (provider === 'openai' && process.env.OPENAI_API_KEY) {
        return await this._callOpenAI(systemPrompt, messages, options);
      } else if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
        return await this._callGemini(systemPrompt, messages, options);
      } else if (provider === 'ollama') {
        return await this._callOllama(systemPrompt, messages, options);
      }
    } catch (err) {
      console.warn(`[LLMProvider] Error calling ${provider}: ${err.message}. Falling back to offline simulator.`);
    }

    // Fallback to offline simulator
    const lastUserMsg = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
    return this.offlineSimulator.generateResponse(lastUserMsg, moodInfo);
  }

  async _callAnthropic(systemPrompt, messages, options) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5' || 'claude-3-5-sonnet-20241022';

    // Format conversation messages
    const formattedMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 350,
        temperature: 0.8,
        system: systemPrompt,
        messages: formattedMessages
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || '';
  }

  async _callOpenAI(systemPrompt, messages, options) {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: formattedMessages,
        temperature: 0.85,
        max_tokens: 350
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  async _callGemini(systemPrompt, messages, options) {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: contents,
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 350
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  async _callOllama(systemPrompt, messages, options) {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const model = process.env.OLLAMA_MODEL || 'llama3';

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
    ];

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        messages: formattedMessages,
        stream: false,
        options: { temperature: 0.8 }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.message?.content || '';
  }
}
