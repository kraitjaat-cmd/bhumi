import chatCorpus from '../persona/chatCorpus.json' with { type: 'json' };

/**
 * Intelligent offline contextual simulator for BhumiAI
 * Powered by 2,170+ authentic WhatsApp chat replies and 850+ conversation pairs.
 * Features cross-chat intelligence across Aradhya, Akanksha (Gogu Bhai), Shivang, and Troonnn.
 * ALWAYS addresses the user as "Troonnn" / "Troon"!
 */
export class OfflineSimulator {
  constructor() {
    this.memoryCount = 0;
    this.recentReplies = [];
    this.maxRecent = 90;
    this.stopWords = new Set([
      'kya', 'hai', 'h', 'to', 'ko', 'se', 'me', 'm', 'hi', 'bhi', 'hoga', 'hogi',
      'kar', 'raha', 'rhi', 'aur', 'ka', 'ki', 'ke', 'ye', 'wo', 'ab', 'the', 'is',
      'a', 'in', 'on', 'of', 'and', 'to', 'tha', 'thi', 'ho', 'hu', 'tune', 'meri'
    ]);
  }

  generateResponse(userText, moodInfo = {}) {
    const text = (userText || '').trim();
    const lowerText = text.toLowerCase();
    this.memoryCount++;

    // 1. Extreme Shivang Rage Trigger (Incandescent Fury from shivang.txt & Bhumi lore)
    if (lowerText.includes('shivang') || lowerText.includes('sibang') || lowerText.includes('btech 2nd year') || lowerText.includes('playerrr')) {
      const rageList = chatCorpus.clusters.shivang_rage;
      if (rageList && rageList.length > 0) {
        return this._pickNonRecent(rageList);
      }
    }

    // 2. Gogu Bhai / Akanksha Sinha & Chemistry / Hostel Banter (From Gogu Bhai chat)
    if (lowerText.includes('gogu') || lowerText.includes('akanksha') || lowerText.includes('akansha') || lowerText.includes('meowlarity') || lowerText.includes('meowthenol') || lowerText.includes('meowthesis') || lowerText.includes('ipad')) {
      const goguList = chatCorpus.clusters.gogu_akanksha_jokes;
      if (goguList && goguList.length > 0) {
        return this._pickNonRecent(goguList);
      }
    }

    // 3. Aradhya Yeah & Fest / Tequila / Secret Website Banter (From Aradhya chat)
    if (lowerText.includes('aradhya') || lowerText.includes('tequila') || lowerText.includes('krait-mafia') || lowerText.includes('14.5') || lowerText.includes('secret website')) {
      const aradhyaList = chatCorpus.clusters.aradhya_yeah_jokes;
      if (aradhyaList && aradhyaList.length > 0) {
        return this._pickNonRecent(aradhyaList);
      }
    }

    // 4. Curly Hair Trigger
    if (lowerText.includes('curls') || lowerText.includes('curly') || lowerText.includes('baal') || lowerText.includes('hair') || lowerText.includes('curl')) {
      const curlList = chatCorpus.clusters.curls_and_hair;
      if (curlList && curlList.length > 0) {
        return this._pickNonRecent(curlList);
      }
    }

    // 5. 10 Million Dollars Dilemma
    if (lowerText.includes('10 million') || lowerText.includes('million') || lowerText.includes('dollar') || lowerText.includes('10m')) {
      const moneyList = chatCorpus.clusters.money_vs_hangout;
      if (moneyList && moneyList.length > 0) {
        return this._pickNonRecent(moneyList);
      }
    }

    // 6. Best Friend Troon / Saroha / KRAIT Banter & Roasts
    if (lowerText.includes('tarun') || lowerText.includes('krait') || lowerText.includes('troon') || lowerText.includes('saroha') || lowerText.includes('naam') || lowerText.includes('editor')) {
      const troonList = chatCorpus.clusters.troon_banter_and_roasts;
      if (troonList && troonList.length > 0) {
        return this._pickNonRecent(troonList);
      }
    }

    // 7. Intelligent QA Pair Matching across 850+ real chat pairs
    const tokens = this._tokenize(lowerText);
    if (tokens.length > 0 && chatCorpus.pairs && chatCorpus.pairs.length > 0) {
      let highestScore = 0;
      const candidates = [];

      for (const pair of chatCorpus.pairs) {
        const pairInputLower = pair.input.toLowerCase();
        let score = 0;

        // Exact substring bonus
        if (pairInputLower.includes(lowerText) || lowerText.includes(pairInputLower)) {
          score += 4.5;
        }

        // Token intersection
        if (pair.keywords && pair.keywords.length > 0) {
          let matchCount = 0;
          for (const token of tokens) {
            if (pair.keywords.includes(token)) {
              matchCount++;
            }
          }
          const jaccard = matchCount / (tokens.length + pair.keywords.length - matchCount);
          score += jaccard * 5.0;
        }

        if (score > 1.2) {
          candidates.push({ pair, score });
          if (score > highestScore) {
            highestScore = score;
          }
        }
      }

      if (candidates.length > 0) {
        // Sort by score descending and select among top candidates avoiding repetition
        candidates.sort((a, b) => b.score - a.score);
        const topCandidates = candidates.slice(0, 8).map(c => c.pair.reply);
        const selected = this._pickNonRecent(topCandidates);
        if (selected) return selected;
      }
    }

    // 8. Thematic Cluster Fallbacks
    if (lowerText.includes('badminton') || lowerText.includes('court') || lowerText.includes('match') || lowerText.includes('racket')) {
      if (chatCorpus.clusters.badminton_sports?.length) {
        return this._pickNonRecent(chatCorpus.clusters.badminton_sports);
      }
    }

    if (lowerText.includes('walk') || lowerText.includes('lawn') || lowerText.includes('baje')) {
      if (chatCorpus.clusters.walks_lawn?.length) {
        return this._pickNonRecent(chatCorpus.clusters.walks_lawn);
      }
    }

    if (lowerText.includes('khana') || lowerText.includes('food') || lowerText.includes('momo') || lowerText.includes('maggi') || lowerText.includes('chai') || lowerText.includes('coffee') || lowerText.includes('mess')) {
      if (chatCorpus.clusters.food_chai_momos?.length) {
        return this._pickNonRecent(chatCorpus.clusters.food_chai_momos);
      }
    }

    if (lowerText.includes('attendance') || lowerText.includes('proxy') || lowerText.includes('class') || lowerText.includes('lab') || lowerText.includes('chemistry') || lowerText.includes('assignment') || lowerText.includes('exam')) {
      if (chatCorpus.clusters.academics_attendance_proxy?.length) {
        return this._pickNonRecent(chatCorpus.clusters.academics_attendance_proxy);
      }
    }

    if (lowerText.includes('sleep') || lowerText.includes('soja') || lowerText.includes('neend') || lowerText.includes('tired') || lowerText.includes('thak') || lowerText.includes('kapde')) {
      if (chatCorpus.clusters.sleep_tired?.length) {
        return this._pickNonRecent(chatCorpus.clusters.sleep_tired);
      }
    }

    // 9. General Fallback drawing from the 2,170+ unique reply database
    if (chatCorpus.allReplies && chatCorpus.allReplies.length > 0) {
      const filtered = chatCorpus.allReplies.filter(r => r.length > 5 && r.length < 160);
      return this._pickNonRecent(filtered);
    }

    // Default emergency fallback
    return "Humm... Sahi h phir to Troonnn 👍";
  }

  _tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !this.stopWords.has(w));
  }

  _pickNonRecent(array) {
    if (!array || array.length === 0) return "Humm... Sahi h Troonnn";

    const available = array.filter(item => !this.recentReplies.includes(item));
    const pool = available.length > 0 ? available : array;

    const chosen = pool[Math.floor(Math.random() * pool.length)];

    this.recentReplies.push(chosen);
    if (this.recentReplies.length > this.maxRecent) {
      this.recentReplies.shift();
    }

    return chosen;
  }
}
