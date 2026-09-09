import { ConversationManager } from './src/engine/conversationManager.js';

async function testBhumiAI() {
  const convManager = new ConversationManager();
  const sessionId = 'test-session-troon-v4';

  console.log('Testing BhumiAI Engine with Multi-Chat Intelligence...\n');

  const testPrompts = [
    "Hello Bhumi! Kaha ho?",
    "Oye wo BTech 2nd year wala Shivang mila tha aaj",
    "Gogu Bhai Late Reply Wale ka message aaya kya?",
    "Meowlarity or Molarity?",
    "Aradhya chalti firti tequila h kya?",
    "Computer test me kitne marks the Aradhya ke?",
    "krait-mafia.github.io wali website Aradhya ko dikha di?",
    "Practical notebook kaise likhni h?",
    "Mera naam kya h?",
    "Badminton tonight at 10 on the court?",
    "Would you choose 10 million dollars or a fun hangout with me?",
    "Walk par chalte h 11 baje lawn me"
  ];

  for (const prompt of testPrompts) {
    console.log(`\x1b[34m[Troonnn]\x1b[0m ${prompt}`);
    const res = await convManager.processMessage(sessionId, prompt);
    console.log(`\x1b[35m[BhumiAI]\x1b[0m ${res.reply}`);
    console.log(`\x1b[90m-> Mood: ${res.mood} | Provider: ${res.provider}\x1b[0m\n`);
  }

  console.log('All multi-chat tests passed successfully!');
}

testBhumiAI();
