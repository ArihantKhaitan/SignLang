/**
 * Accumulates letter predictions into words and sentences.
 *
 *  - a letter must be held HOLD_MS to register
 *  - no confident prediction for SPACE_MS finalises the current word
 *  - repeating the same letter needs a short cooldown (double letters work
 *    by dropping the hand briefly, then holding the sign again)
 */
const HOLD_MS = 1200;
const SPACE_MS = 2200;
const MIN_CONFIDENCE = 0.7;
const REPEAT_COOLDOWN_MS = HOLD_MS * 1.3;

export class SentenceBuilder {
  constructor() { this.clear(); }

  clear() {
    this.currentLetter = null;
    this.holdProgress = 0;
    this.currentWord = '';
    this.words = [];
    this._holdStart = performance.now();
    this._lastConfident = performance.now();
    this._lastRegistered = null;
    this._lastRegisteredAt = 0;
  }

  /** Call every frame with the smoothed prediction. Returns true if a letter registered. */
  update(label, confidence) {
    const now = performance.now();
    let registered = false;

    if (label && confidence >= MIN_CONFIDENCE) {
      this._lastConfident = now;
      if (label === this.currentLetter) {
        const elapsed = now - this._holdStart;
        this.holdProgress = Math.min(elapsed / HOLD_MS, 1);
        if (elapsed >= HOLD_MS) {
          const okRepeat = this._lastRegistered !== label ||
            now - this._lastRegisteredAt > REPEAT_COOLDOWN_MS;
          if (okRepeat) {
            this._register(label, now);
            registered = true;
          }
          this._holdStart = now;
        }
      } else {
        this.currentLetter = label;
        this._holdStart = now;
        this.holdProgress = 0;
      }
    } else {
      this.currentLetter = null;
      this.holdProgress = 0;
      if (now - this._lastConfident >= SPACE_MS && this.currentWord) this.endWord();
    }
    return registered;
  }

  backspace() {
    if (this.currentWord) this.currentWord = this.currentWord.slice(0, -1);
    else if (this.words.length) this.words.pop();
  }

  endWord() {
    if (this.currentWord) {
      this.words.push(this.currentWord);
      this.currentWord = '';
    }
  }

  get fullText() {
    return [...this.words, this.currentWord].filter(Boolean).join(' ');
  }

  state() {
    return {
      currentLetter: this.currentLetter,
      holdProgress: this.holdProgress,
      currentWord: this.currentWord,
      words: [...this.words],
      fullText: this.fullText,
    };
  }

  _register(label, now) {
    this.currentWord += label;
    this._lastRegistered = label;
    this._lastRegisteredAt = now;
  }
}
