// ==========================================================================
// 🌿 BHUMIAI — CLEAN MINIMALIST BOHEMIAN CHATGPT CONTROLLER
// ==========================================================================

const sessionId = 'web-user-' + Math.random().toString(36).substring(2, 9);
let soundEnabled = true;
const recentReplies = [];
const maxRecent = 120;

// DOM Elements
const sidebar = document.getElementById('sidebar');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
const chatScrollWrapper = document.getElementById('chatScrollWrapper');
const chatStream = document.getElementById('chatStream');
const landingHero = document.getElementById('landingHero');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');
const vibeBadge = document.getElementById('vibeBadge');
const themeBtn = document.getElementById('themeBtn');
const clearBtn = document.getElementById('clearBtn');
const newChatBtn = document.getElementById('newChatBtn');

// ==========================================================================
// 1. SIDEBAR & THEME HELPERS
// ==========================================================================
function toggleSidebar() {
  if (sidebar) {
    sidebar.classList.toggle('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.toggle('active', sidebar.classList.contains('open'));
  }
}

function closeSidebar() {
  if (sidebar && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  const label = isDark ? '☀️' : '🌓';
  if (themeBtn) themeBtn.textContent = label;
  const headerTheme = document.getElementById('headerThemeBtn');
  if (headerTheme) headerTheme.textContent = label;
}

function clearCurrentChat() {
  if (confirm('Clear current conversation?')) {
    resetChatConversation();
  }
}

window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.toggleTheme = toggleTheme;
window.clearCurrentChat = clearCurrentChat;

// ==========================================================================
// 2. AUDIO CHIME ENGINE (ORGANIC WEB AUDIO API)
// ==========================================================================
function playChime(isRage = false) {
  if (!soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (isRage) {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + (isRage ? 0.4 : 0.25));
  } catch (e) {}
}

// ==========================================================================
// 3. MESSAGE FORMATTING & DOM RENDERING
// ==========================================================================
function getFormattedTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function appendMessageTurn(text, isUser = false, isRage = false) {
  if (landingHero) landingHero.classList.add('hidden');

  const turn = document.createElement('div');
  turn.className = `message-turn ${isUser ? 'user-turn' : 'assistant-turn'} ${isRage ? 'rage-turn' : ''}`;

  const avatar = document.createElement('div');
  avatar.className = 'turn-avatar';

  if (isUser) {
    avatar.textContent = '🎨';
  } else {
    avatar.innerHTML = `
      <svg class="avatar-svg-small" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="54" r="22" fill="#E8B896"/>
        <circle cx="28" cy="40" r="14" fill="#2E1C14"/>
        <circle cx="72" cy="40" r="14" fill="#2E1C14"/>
        <circle cx="40" cy="30" r="15" fill="#3D261C"/>
        <circle cx="60" cy="30" r="15" fill="#2E1C14"/>
        <circle cx="50" cy="24" r="14" fill="#4A3124"/>
        <path d="M32 38 Q50 32 68 38" stroke="#C4684D" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `;
  }

  const content = document.createElement('div');
  content.className = 'turn-content';

  const header = document.createElement('div');
  header.className = 'turn-header';
  header.innerHTML = `
    <span class="sender-name">${isUser ? 'Troonnn' : 'Bhumi'}</span>
    <span class="turn-time">${getFormattedTime()}</span>
  `;

  const body = document.createElement('div');
  body.className = 'turn-body';
  body.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;

  content.appendChild(header);
  content.appendChild(body);

  if (isUser) {
    turn.appendChild(content);
    turn.appendChild(avatar);
  } else {
    turn.appendChild(avatar);
    turn.appendChild(content);
  }

  chatStream.appendChild(turn);
  scrollToBottom();
}

function scrollToBottom() {
  if (chatScrollWrapper) {
    chatScrollWrapper.scrollTop = chatScrollWrapper.scrollHeight;
  }
}

function triggerRageShake() {
  const layout = document.getElementById('appLayout') || document.body;
  layout.classList.remove('rage-mode');
  void layout.offsetWidth;
  layout.classList.add('rage-mode');
  setTimeout(() => layout.classList.remove('rage-mode'), 2500);
}

// ==========================================================================
// 4. CLIENT CORPUS HEURISTIC & NLP MATCHING ENGINE (2,170+ REPLIES)
// ==========================================================================
function pickNonRecent(arr) {
  if (!arr || arr.length === 0) return "Humm... Sahi h phir to Troonnn 👍";
  const available = arr.filter(item => !recentReplies.includes(item));
  const pool = available.length > 0 ? available : arr;
  const chosen = pool[Math.floor(Math.random() * pool.length)];

  recentReplies.push(chosen);
  if (recentReplies.length > maxRecent) recentReplies.shift();
  return chosen;
}

function simulateCorpusResponse(input) {
  const text = (input || '').toLowerCase().trim();
  const corpus = window.BHUMI_CORPUS;

  if (!corpus) {
    return {
      reply: "Helloooo Troonnn ✨ Bolo kya bol rhe the?",
      isRage: false,
      vibe: "🌿 Bohemian & Chill"
    };
  }

  // 1. Shivang Rage Trigger
  if (text.includes('shivang') || text.includes('sibang') || text.includes('btech 2nd year') || text.includes('playerrr')) {
    return {
      reply: pickNonRecent(corpus.clusters.shivang_rage),
      isRage: true,
      vibe: "🤬 PURE RAGE: Mentioned Shivang"
    };
  }

  // 2. Gogu Bhai / Akanksha Sinha Jokes (from Gogu chat)
  if (text.includes('gogu') || text.includes('akanksha') || text.includes('akansha') || text.includes('meowlarity') || text.includes('meowthenol') || text.includes('meowthesis') || text.includes('ipad')) {
    return {
      reply: pickNonRecent(corpus.clusters.gogu_akanksha_jokes),
      isRage: false,
      vibe: "🐱 Laughing with Gogu Bhai"
    };
  }

  // 3. Aradhya Yeah / Tequila / Secret Website (from Aradhya chat)
  if (text.includes('aradhya') || text.includes('tequila') || text.includes('krait-mafia') || text.includes('14.5') || text.includes('secret website')) {
    return {
      reply: pickNonRecent(corpus.clusters.aradhya_yeah_jokes),
      isRage: false,
      vibe: "✨ Fest & Reels Gossip"
    };
  }

  // 4. Curls & Hair
  if (text.includes('curls') || text.includes('curly') || text.includes('baal') || text.includes('hair') || text.includes('serum')) {
    return {
      reply: pickNonRecent(corpus.clusters.curls_and_hair),
      isRage: false,
      vibe: "👩‍🦱 Wild Curls & Sassy Mood"
    };
  }

  // 5. 10 Million Dollars Dilemma
  if (text.includes('10 million') || text.includes('million') || text.includes('dollar') || text.includes('10m')) {
    return {
      reply: pickNonRecent(corpus.clusters.money_vs_hangout),
      isRage: false,
      vibe: "💰 10M$ > Troonnn 💅"
    };
  }

  // 6. Troonnn Banter & Roasts
  if (text.includes('tarun') || text.includes('krait') || text.includes('troon') || text.includes('saroha') || text.includes('naam') || text.includes('editor')) {
    return {
      reply: pickNonRecent(corpus.clusters.troon_banter_and_roasts),
      isRage: false,
      vibe: "😏 Sarcastic & Teasing"
    };
  }

  // 7. QA Pair Fuzzy Matching across 850+ authentic pairs
  const tokens = text.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
  if (tokens.length > 0 && corpus.pairs) {
    const candidates = [];
    for (const pair of corpus.pairs) {
      const pIn = pair.input.toLowerCase();
      let score = 0;
      if (pIn.includes(text) || text.includes(pIn)) score += 4.5;
      if (pair.keywords) {
        let matches = 0;
        for (const tok of tokens) {
          if (pair.keywords.includes(tok)) matches++;
        }
        score += (matches / (tokens.length + pair.keywords.length - matches)) * 5.0;
      }
      if (score > 1.2) {
        candidates.push({ reply: pair.reply, score });
      }
    }
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.score - a.score);
      const top = candidates.slice(0, 8).map(c => c.reply);
      return {
        reply: pickNonRecent(top),
        isRage: false,
        vibe: "🌿 Bohemian & Chill"
      };
    }
  }

  // 8. Thematic Clusters
  if (text.includes('badminton') || text.includes('court') || text.includes('racket')) {
    return { reply: pickNonRecent(corpus.clusters.badminton_sports), isRage: false, vibe: "🏸 Playful & Energetic" };
  }
  if (text.includes('walk') || text.includes('lawn') || text.includes('11 baje') || text.includes('10 baje')) {
    return { reply: pickNonRecent(corpus.clusters.walks_lawn), isRage: false, vibe: "🌙 Chill & Relaxed" };
  }
  if (text.includes('khana') || text.includes('food') || text.includes('chai') || text.includes('momo') || text.includes('maggi') || text.includes('mess')) {
    return { reply: pickNonRecent(corpus.clusters.food_chai_momos), isRage: false, vibe: "🍜 Hungry & Craving Food" };
  }
  if (text.includes('attendance') || text.includes('proxy') || text.includes('class') || text.includes('lab') || text.includes('chemistry') || text.includes('exam')) {
    return { reply: pickNonRecent(corpus.clusters.academics_attendance_proxy), isRage: false, vibe: "📚 Stressed about Attendance" };
  }
  if (text.includes('sleep') || text.includes('neend') || text.includes('soja') || text.includes('tired') || text.includes('thak') || text.includes('kapde')) {
    return { reply: pickNonRecent(corpus.clusters.sleep_tired), isRage: false, vibe: "😴 Sleepy & Exhausted" };
  }

  // 9. Draw from 2,170+ unique authentic replies
  const generalPool = corpus.allReplies.filter(r => r.length > 5 && r.length < 160);
  return {
    reply: pickNonRecent(generalPool),
    isRage: false,
    vibe: "🌿 Bohemian & Chill"
  };
}

// ==========================================================================
// 5. MESSAGE SENDING & API ORCHESTRATION
// ==========================================================================
async function handleSend(customText) {
  const text = (customText || userInput.value).trim();
  if (!text) return;

  const mentionsShivang = text.toLowerCase().includes('shivang') || text.toLowerCase().includes('sibang');

  // Render User Message Turn
  appendMessageTurn(text, true);
  if (!customText) {
    userInput.value = '';
    userInput.style.height = 'auto';
  }
  closeSidebar();

  if (mentionsShivang) {
    triggerRageShake();
    if (vibeBadge) {
      vibeBadge.querySelector('.vibe-text').textContent = "🤬 RAGE: Mentioned Shivang";
      vibeBadge.classList.add('rage');
    }
  }

  // Show typing indicator
  if (typingIndicator) {
    typingIndicator.classList.remove('hidden');
    scrollToBottom();
  }

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        sessionId: sessionId
      })
    });

    const data = await res.json();
    const delay = Math.min(900, Math.max(320, (data.reply || '').length * 10));

    setTimeout(() => {
      if (typingIndicator) typingIndicator.classList.add('hidden');

      if (data.reply) {
        const isRage = mentionsShivang || (data.moodData && data.moodData.mood === 'furious_hate_shivang');
        if (isRage) {
          triggerRageShake();
          playChime(true);
        } else {
          playChime(false);
        }

        appendMessageTurn(data.reply, false, isRage);
      }

      if (data.mood && vibeBadge) {
        vibeBadge.querySelector('.vibe-text').textContent = data.mood;
        if (mentionsShivang) vibeBadge.classList.add('rage');
        else vibeBadge.classList.remove('rage');
      }
    }, delay);

  } catch (err) {
    // Client-side fallback using 2,170+ multi-chat corpus
    setTimeout(() => {
      if (typingIndicator) typingIndicator.classList.add('hidden');

      const fallback = simulateCorpusResponse(text);
      if (fallback.isRage) {
        triggerRageShake();
        playChime(true);
      } else {
        playChime(false);
      }

      appendMessageTurn(fallback.reply, false, fallback.isRage);
      if (vibeBadge) {
        vibeBadge.querySelector('.vibe-text').textContent = fallback.vibe;
        if (fallback.isRage) vibeBadge.classList.add('rage');
        else vibeBadge.classList.remove('rage');
      }
    }, 450);
  }
}

// ==========================================================================
// 6. EVENT LISTENERS & INITIALIZATION
// ==========================================================================

if (chatForm) {
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSend();
  });
}

if (userInput) {
  userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(120, userInput.scrollHeight) + 'px';
  });

  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });
}

// Prompt Cards on Landing Screen
document.querySelectorAll('.prompt-card').forEach(card => {
  card.addEventListener('click', () => {
    const prompt = card.getAttribute('data-prompt');
    if (prompt) handleSend(prompt);
  });
});

// Quick Chips above Capsule
document.querySelectorAll('.quick-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const msg = chip.getAttribute('data-msg');
    if (msg) handleSend(msg);
  });
});

// Reset / New Chat
function resetChatConversation() {
  chatStream.innerHTML = `
    <div class="message-turn assistant-turn">
      <div class="turn-avatar">
        <svg class="avatar-svg-small" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="54" r="22" fill="#E8B896"/>
          <circle cx="28" cy="40" r="14" fill="#2E1C14"/>
          <circle cx="72" cy="40" r="14" fill="#2E1C14"/>
          <circle cx="40" cy="30" r="15" fill="#3D261C"/>
          <circle cx="60" cy="30" r="15" fill="#2E1C14"/>
          <circle cx="50" cy="24" r="14" fill="#4A3124"/>
          <path d="M32 38 Q50 32 68 38" stroke="#C4684D" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="turn-content">
        <div class="turn-header">
          <span class="sender-name">Bhumi</span>
          <span class="turn-time">${getFormattedTime()}</span>
        </div>
        <div class="turn-body">
          <p>Sb saaf kar diya tune Troonnn? 🙄<br>Chalo bolo ab kya naya bolna h... Koi shant si baat karna!</p>
        </div>
      </div>
    </div>
  `;

  if (landingHero) landingHero.classList.remove('hidden');
  if (vibeBadge) {
    vibeBadge.querySelector('.vibe-text').textContent = '🌿 Bohemian & Chill';
    vibeBadge.classList.remove('rage');
  }

  const layout = document.getElementById('appLayout') || document.body;
  layout.classList.remove('rage-mode');
  closeSidebar();
}

window.resetChatConversation = resetChatConversation;

if (newChatBtn) newChatBtn.addEventListener('click', resetChatConversation);
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    if (confirm('Clear the conversation?')) resetChatConversation();
  });
}

if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
