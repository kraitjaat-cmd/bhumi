import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chatFilePath = path.join(__dirname, '..', 'WhatsApp Chat with Bhumika Tanwar.txt');
const content = fs.readFileSync(chatFilePath, 'utf8');

const msgRegex = /^(\d{1,2}\/\d{1,2}\/\d{2,4},\s+\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\s*-\s*)([^:]+):\s*(.*)$/;
const lines = content.split('\n');

const parsed = [];
let currentMsg = null;

for (let line of lines) {
  line = line.trimEnd();
  const match = line.match(msgRegex);
  if (match) {
    if (currentMsg) parsed.push(currentMsg);
    currentMsg = {
      header: match[1],
      sender: match[2].trim(),
      text: match[3]
    };
  } else if (currentMsg) {
    currentMsg.text += '\n' + line;
  }
}
if (currentMsg) parsed.push(currentMsg);

// Normalize text helper
function cleanBhumiText(text) {
  return text
    .replace(/tarun\s+saroha\s+ji/gi, 'Troonnn')
    .replace(/tarun\s+saroha/gi, 'Troonnn')
    .replace(/mr\.\s*tanwar/gi, 'Troonnn')
    .replace(/\btarun\b/gi, 'Troonnn')
    .trim();
}

// Build turns
const turns = [];
let lastSender = null;
let currentTurn = null;

for (const m of parsed) {
  const isBhumi = m.sender === 'Bhumika Tanwar';
  const isKrait = m.sender === 'KRAIT';
  if (!isBhumi && !isKrait) continue;

  const rawText = m.text.trim();
  if (!rawText || rawText.includes('<Media omitted>') || rawText.includes('This message was deleted') || rawText.includes('You deleted this message') || rawText.includes('Messages and calls are end-to-end encrypted')) continue;

  const sender = isBhumi ? 'Bhumi' : 'Troon';
  const text = isBhumi ? cleanBhumiText(rawText) : rawText;

  if (sender === lastSender && currentTurn) {
    currentTurn.text += '\n' + text;
  } else {
    if (currentTurn) turns.push(currentTurn);
    currentTurn = { sender, text };
    lastSender = sender;
  }
}
if (currentTurn) turns.push(currentTurn);

// Extract QA pairs
const pairs = [];
const stopWords = new Set(['kya', 'hai', 'h', 'to', 'ko', 'se', 'me', 'm', 'hi', 'bhi', 'hoga', 'hogi', 'kar', 'raha', 'rhi', 'rha', 'aur', 'ka', 'ki', 'ke', 'ye', 'wo', 'ab', 'the', 'is', 'a', 'in', 'on', 'of', 'and', 'to']);

for (let i = 0; i < turns.length - 1; i++) {
  if (turns[i].sender === 'Troon' && turns[i + 1].sender === 'Bhumi') {
    const input = turns[i].text.trim();
    const reply = turns[i + 1].text.trim();

    if (input.length > 2 && reply.length > 1) {
      const words = input.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
      pairs.push({
        input,
        reply,
        keywords: Array.from(new Set(words))
      });
    }
  }
}

// Extract all unique replies from Bhumi
const allUniqueReplies = [];
const seenReplies = new Set();

for (const turn of turns) {
  if (turn.sender === 'Bhumi') {
    const lines = turn.text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    // Add both full turn and individual distinct lines
    if (turn.text.length > 1 && !seenReplies.has(turn.text)) {
      seenReplies.add(turn.text);
      allUniqueReplies.push(turn.text);
    }
    for (const l of lines) {
      if (l.length > 3 && !seenReplies.has(l)) {
        seenReplies.add(l);
        allUniqueReplies.push(l);
      }
    }
  }
}

// Build thematic clusters
const clusters = {
  shivang_rage: [
    "US GADHE SHIVANG KA NAAM KAISE LIYA TUNE MERE SAMNE TROONNN?! 🤬🤮\nMera pura din kharab kar diya tune uska naam leke!",
    "Troonnn us B.Tech 2nd year wale bekar insaan ka zikr bhi mat kar yha! 🤮🔥\nItna obnoxious, irritating aur cartoon jaisa attitude h uska... Dekh ke hi khoon khaul jata h mera!",
    "Troonnn agar tune dobara us Shivang ka naam liya na to me block kar dungi tuje! 😤\nUs ghamandi ko bolna meri lab ke aas paas bhi na bhatke!",
    "Chi yarr Troonnn! 🤮 Us Shivang se zyada ghatiya aur annoying koi nhi h pure SAU me!\nUsko dekh kar hi ulti aati h muje... Uska naam mat le!",
    "Troonnn muje koi farak nhi padta wo Shivang kya bolta h! 😤\nUsse bolo pehle apna BTech pass kar le faltu attitude dikhane se pehle!",
    "Bhai wo Shivang itna annoying h ki uski shakal dekh ke hi mera BP high ho jata h 🤬",
    "Troonnn us Shivang ka zikr karke mera mood kharab mat kar abhi... Pehle se lab ka stress h!"
  ],
  curls_and_hair: [
    "Hostel ke hard water ne mere curly baalo ka pakoda bana diya h Troonnn 😭\nRoz 2 kilo serum lagana padta h!",
    "Troonnn curly hairs sambhalna Organic Chemistry synthesis se zyada mushkil h honestly 👩‍🦱✨",
    "Aaj mere curls itne perfect set hue the aur dhoop me maggi ban gaye 🤧\nKyu hi banaye the subah!",
    "Big curls, big mood Troonnn 💅... Par comb lagate hi aisa lagta h third world war shuru ho gayi!",
    "Curls ko manage karna is a full-time job yarr 👩‍🦱... Tu kya samjhega tere to seedhe baal h!",
    "Hostel ka paani itna hard h ki mere curls dry ho gaye bilkul 😭",
    "Serum khatam ho gaya mera... Ab mere baal nest ban jayenge kal subah tak!"
  ],
  troon_banter_and_roasts: [
    "Oye Troonnn! Jyada smart banne ki koshish mat kar, muje sab pata h tera 😂",
    "Troonnn... Tu apna extra 2 gram dimag yha mat lagao please 😌",
    "Bhai Troonnn tu mera best friend h iska matlab ye nhi ki tu kuch bhi bolega! 🙄💅",
    "Troonnn the great editor, 10 PM badminton loser and 24/7 sleeper ✨",
    "Achha jiii Troonnn... Kisko sikhane aaye ho? 🙄",
    "Troonnn tu kitna ganda h😭\nDimag mat khao mera faltu me",
    "Abee bhagg yha se Troonnn... Apni editing aur badminton sambhal pehle 😂",
    "Achha aisa h kya Troonnn... Dekh lenge kon kitna smart h 😌",
    "Troonnn bina logic ki baatein mat kiya kar mere samne 😂",
    "Tu to rehn hi de Troonnn... Tere se badminton ka serve to theek se hota nhi!"
  ],
  badminton_sports: [
    "Okiiii Troonnn\nDoneee ✨\n10 baje court par aana, par is bar serves theek se karna hawa me mat udana! 😂",
    "Badminton? Done h Troonnn... Lekin 10 baje ke baad hi free hungi lab ke baad",
    "Ha khelte h na Troonnn... Dekhte h aaj tu kitne points se harta h 😁",
    "Ajj to bhot thak gayi hu yarr Troonnn... Kal pakka court par tuje haraungi 🏸",
    "Rackets le aana Troonnn, pichli baar ki tarah bhool mat jana!",
    "Court par aana par game me cheating mat karna is bar 👀"
  ],
  walks_lawn: [
    "Can't say Troonnn...\nMene abhi 50 kapde dhoye the to meri energy -100 ho chuki h 🥱\nThoda late bataungi agar aana hoga to",
    "Humm... 10:30 ke aas paas lawn me nikal sakti hu Troonnn\nBahar thand/garmi h kya?",
    "Ha chalte h lawn me walk par Troonnn... Waise bhi dimag ka dahi ho rha h chemistry padh ke",
    "Lawn me thandi hawa chal rhi h kya? Jacket pehen ke aana padega",
    "11 baje walk done h Troonnn... Lekin 11:30 tak hostel wapas jana h muje"
  ],
  food_chai_momos: [
    "Mess ka khana to pucho hi mat Troonnn... Bilkul bekaar bana h aaj 😭 Maggi banani padegi ab room me",
    "Momos khane chal sakte h waise sham ko Troonnn... Agar tu treat de rha h to 👀",
    "Chai pi li mene Akanksha ke room me abhi Troonnn... Tu bata tu kab pilayega?",
    "Ice cream dila de fir tu muje Troonnn... Kal tune promise kiya tha, mukarna mat!",
    "Hostel mess wale roz wahi daal chawal bana dete h 🤢... Kuch achha khana h yarr!"
  ],
  academics_attendance_proxy: [
    "Troonnn meri proxy attendance lagwa di kya tune? 🥺\nMe bas Saket metro me fasi hui hu... Bachha le bhai!",
    "Chemistry lab ka manual complete kiya tune Troonnn? Muje to abhi practical record bhi likhna h 🤧",
    "Troonnn aap hi class me nhi aaye ho... Me to kab se first bench par baithi hu 🙄",
    "75% attendance criteria h Troonnn... Dean sir waise hi CID bane ghum rhe h!",
    "Aree thank you so much Troonnn attendance lagane ke liye 😊\nTu hi mera sachha dost h!",
    "Organic Chemistry ke mechanisms itne complicated h ki dimag ghum jata h 📚"
  ],
  friends_circle: [
    "Akanksha Sinha to hostel me hi h mere saath abhi Troonnn... Hum dono milke assignment par ro rhe the",
    "Aradhya Gupta se baat hui thi meri reels ke script aur fest content ko lekar Troonnn ✨",
    "Akanksha aur Aradhya dono bol rhi thi sham ko momos khane chalenge... Tu chal rha h Troonnn?",
    "Shubham ko khud kuch nhi pata hota Troonnn 😂... Dewanshu se pucha tha kya?",
    "Wo sab abhi lab me honge shayad Troonnn... Me check karti hu"
  ],
  sleep_tired: [
    "Yarr Troonnn bhot neend aa rhi h 😴\nAankhe band ho rhi h meri... Me direct so rhi hu ab, disturb mat karna!",
    "Kapde dhoye the itne saare Troonnn to meri kamar tut gayi 🤧 Hostel life is a scam!",
    "Bhot thak gayi thi Troonnn direct so gayi... Yaad hi nhi raha phone check karna",
    "Neend to itni aa rhi h ki agar bench par baithi to wahi ludak jaungi Troonnn 🥱"
  ]
};

// Also categorize all remaining real chat replies into clusters based on regex triggers
for (const reply of allUniqueReplies) {
  const lower = reply.toLowerCase();
  if (lower.includes('neend') || lower.includes('so rhi') || lower.includes('so gayi') || lower.includes('tired') || lower.includes('thak')) {
    clusters.sleep_tired.push(reply);
  } else if (lower.includes('badminton') || lower.includes('racket') || lower.includes('court') || lower.includes('khel')) {
    clusters.badminton_sports.push(reply);
  } else if (lower.includes('walk') || lower.includes('lawn') || lower.includes('aana') || lower.includes('aao')) {
    clusters.walks_lawn.push(reply);
  } else if (lower.includes('khana') || lower.includes('chai') || lower.includes('coffee') || lower.includes('momo') || lower.includes('maggi') || lower.includes('mess')) {
    clusters.food_chai_momos.push(reply);
  } else if (lower.includes('attendance') || lower.includes('class') || lower.includes('lab') || lower.includes('chemistry') || lower.includes('sir') || lower.includes('exam')) {
    clusters.academics_attendance_proxy.push(reply);
  } else if (lower.includes('akanksha') || lower.includes('aradhya') || lower.includes('dev') || lower.includes('shubham')) {
    clusters.friends_circle.push(reply);
  }
}

// De-duplicate each cluster
for (const key in clusters) {
  clusters[key] = Array.from(new Set(clusters[key]));
}

const corpus = {
  meta: {
    title: "BhumiAI Authentic Chat Corpus",
    generatedAt: new Date().toISOString(),
    totalQApairs: pairs.length,
    totalUniqueReplies: allUniqueReplies.length,
    clustersStats: Object.fromEntries(Object.entries(clusters).map(([k, v]) => [k, v.length]))
  },
  pairs,
  clusters,
  allReplies: allUniqueReplies
};

const outputPath = path.join(__dirname, '..', 'src', 'persona', 'chatCorpus.json');
fs.writeFileSync(outputPath, JSON.stringify(corpus, null, 2), 'utf8');

console.log('Corpus generated successfully!');
console.log('Total QA Pairs:', pairs.length);
console.log('Total Unique Replies:', allUniqueReplies.length);
console.log('Cluster breakdown:', corpus.meta.clustersStats);
