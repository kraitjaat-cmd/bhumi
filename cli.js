import readline from 'readline';
import dotenv from 'dotenv';
import { ConversationManager } from './engine/conversationManager.js';
import profile from './persona/profile.json' with { type: 'json' };

dotenv.config();

const convManager = new ConversationManager();
const sessionId = 'cli-user';

console.clear();
console.log('\x1b[35m========================================================================\x1b[0m');
console.log('\x1b[1m\x1b[36m                     🌸 BhumiAI - Bhumika Tanwar 🌸                    \x1b[0m');
console.log('\x1b[35m========================================================================\x1b[0m');
console.log('\x1b[90mPersonality & Memory based on 4,250+ WhatsApp messages with Tarun (KRAIT)\x1b[0m');
console.log('\x1b[90mActive Provider: \x1b[32m' + convManager.llmProvider.getProviderType() + '\x1b[0m');
console.log('\x1b[90mCommands: /mood, /profile, /clear, /exit\x1b[0m\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function promptUser() {
  rl.question('\x1b[1m\x1b[34mTarun: \x1b[0m', async (input) => {
    const trimmed = (input || '').trim();

    if (!trimmed) {
      promptUser();
      return;
    }

    if (trimmed === '/exit' || trimmed === '/quit') {
      console.log('\n\x1b[35mBhumiAI:\x1b[0m Byeee! Me sone ja rhi hu ab 🥱✨\n');
      rl.close();
      process.exit(0);
    }

    if (trimmed === '/clear') {
      convManager.clearSession(sessionId);
      console.log('\x1b[33m[Chat history cleared]\x1b[0m\n');
      promptUser();
      return;
    }

    if (trimmed === '/profile') {
      console.log('\n\x1b[36m--- Bhumika Profile Summary ---\x1b[0m');
      console.log(`Name: ${profile.name} (${profile.nickname})`);
      console.log(`College: ${profile.institution}`);
      console.log(`Degree: ${profile.degree}`);
      console.log(`Hometown: ${profile.hometown}`);
      console.log(`Key Friends: ${profile.circle_and_social_graph.batchmates_female.join(', ')} | ${profile.circle_and_social_graph.batchmates_male.join(', ')}`);
      console.log(`Hobbies: ${profile.daily_routines_and_hobbies.hobbies.join(', ')}\n`);
      promptUser();
      return;
    }

    if (trimmed === '/mood') {
      const session = convManager.getSession(sessionId);
      console.log(`\n\x1b[33mCurrent Mood:\x1b[0m ${session.moodTracker.getMoodLabel()}\n`);
      promptUser();
      return;
    }

    process.stdout.write('\x1b[90mBhumi is typing...\x1b[0m\r');

    try {
      const result = await convManager.processMessage(sessionId, trimmed);
      process.stdout.write('                     \r'); // clear typing indicator

      console.log(`\x1b[1m\x1b[35mBhumiAI:\x1b[0m ${result.reply}`);
      console.log(`\x1b[90m[${result.mood}]\x1b[0m\n`);
    } catch (err) {
      process.stdout.write('                     \r');
      console.log(`\x1b[31mError:\x1b[0m ${err.message}\n`);
    }

    promptUser();
  });
}

promptUser();
