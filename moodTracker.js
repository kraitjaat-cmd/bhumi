export class MoodTracker {
  constructor() {
    this.currentMood = 'natural';
    this.energyLevel = 80; // 0 to 100
    this.sleepiness = 30; // 0 to 100
    this.playfulness = 70; // 0 to 100
  }

  updateMood(userMessage) {
    const text = (userMessage || '').toLowerCase();
    const hour = new Date().getHours();

    // Time-based mood influences
    if (hour >= 23 || hour < 6) {
      this.sleepiness = Math.min(100, this.sleepiness + 25);
      this.energyLevel = Math.max(10, this.energyLevel - 20);
    } else if (hour >= 6 && hour < 9) {
      this.sleepiness = Math.min(80, this.sleepiness + 15);
    } else {
      this.sleepiness = Math.max(10, this.sleepiness - 10);
      this.energyLevel = Math.min(100, this.energyLevel + 10);
    }

    // Keyword & trigger based adjustment
    if (text.includes('shivang')) {
      this.currentMood = 'furious_hate_shivang';
      this.playfulness = 0;
      this.energyLevel = 100; // Spikes in pure rage!
    } else if (text.includes('curls') || text.includes('curly') || text.includes('baal') || text.includes('hair')) {
      this.currentMood = 'curly_chaos';
      this.playfulness = Math.min(100, this.playfulness + 15);
    } else if (text.includes('sleep') || text.includes('so jao') || text.includes('soo rhi') || text.includes('neend') || text.includes('tired') || text.includes('kapde') || text.includes('thak')) {
      this.currentMood = 'sleepy';
      this.sleepiness = Math.min(100, this.sleepiness + 30);
    } else if (text.includes('badminton') || text.includes('walk') || text.includes('chess') || text.includes('khel')) {
      this.currentMood = 'playful';
      this.playfulness = Math.min(100, this.playfulness + 20);
      this.energyLevel = Math.min(100, this.energyLevel + 15);
    } else if (text.includes('exam') || text.includes('assignment') || text.includes('lab') || text.includes('attendance') || text.includes('proxy') || text.includes('chemistry') || text.includes('dean') || text.includes('quiz')) {
      this.currentMood = 'studious_stressed';
      this.playfulness = Math.max(30, this.playfulness - 15);
    } else if (text.includes('sundar') || text.includes('preety') || text.includes('pretty') || text.includes('cute') || text.includes('miss') || text.includes('sorry') || text.includes('thanks') || text.includes('dhanyawad')) {
      this.currentMood = 'sweet_caring';
    } else if (text.includes('blackmail') || text.includes('gyaan') || text.includes('10 million') || text.includes('modi') || text.includes('troon') || text.includes('gadhe') || text.includes('bhukkad') || text.includes('smart')) {
      this.currentMood = 'teasing_sarcastic';
      this.playfulness = Math.min(100, this.playfulness + 25);
    } else {
      if (this.sleepiness > 70) {
        this.currentMood = 'sleepy';
      } else {
        this.currentMood = 'natural';
      }
    }

    return {
      mood: this.currentMood,
      energy: this.energyLevel,
      sleepiness: this.sleepiness,
      playfulness: this.playfulness
    };
  }

  getMoodLabel() {
    switch (this.currentMood) {
      case 'furious_hate_shivang':
        return '🤬 PURE RAGE (Despises Shivang)';
      case 'curly_chaos':
        return '👩‍🦱 Wild Curls & Sassy Mood';
      case 'sleepy':
        return '😴 Sleepy & Exhausted';
      case 'playful':
        return '🏸 Playful & Energetic';
      case 'teasing_sarcastic':
        return '😏 Sarcastic & Teasing';
      case 'studious_stressed':
        return '📚 Stressed about Labs/Attendance';
      case 'sweet_caring':
        return '🌸 Warm & Sweet';
      default:
        return '🌿 Bohemian & Chill';
    }
  }
}
