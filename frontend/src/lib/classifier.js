import asl from '../model/aslModel.json';
import bsl from '../model/bslModel.json';
import isl from '../model/islModel.json';
import { normalizeLandmarks, normalizeTwoHands, mlpForward } from './mlp';

/** Sign-language registry — three on-device MLP models. */
export const LANGUAGES = {
  asl: { key: 'asl', name: 'ASL', full: 'American Sign Language', model: asl, numHands: 1 },
  bsl: { key: 'bsl', name: 'BSL', full: 'British Sign Language', model: bsl, numHands: 2 },
  isl: { key: 'isl', name: 'ISL', full: 'Indian Sign Language', model: isl, numHands: 2 },
};

export function supportedSymbols(lang) {
  return new Set(LANGUAGES[lang].model.labels);
}

/** Classify detected hands (array of 21-landmark arrays). */
export function classifyHands(lang, hands) {
  const { model, numHands } = LANGUAGES[lang];
  const feats = numHands === 2
    ? normalizeTwoHands(hands)
    : normalizeLandmarks(hands[0], model.useZ);
  const probs = mlpForward(model, feats);
  let best = 0;
  for (let i = 1; i < probs.length; i++) if (probs[i] > probs[best]) best = i;
  return { label: model.labels[best], confidence: probs[best] };
}

/**
 * Majority-vote smoother over the last N frames.
 * Kills single-frame flickers before they reach the sentence builder.
 */
export class PredictionSmoother {
  constructor(window = 7, minAgree = 4) {
    this.window = window;
    this.minAgree = minAgree;
    this.history = [];
  }

  push(label, confidence) {
    this.history.push({ label, confidence });
    if (this.history.length > this.window) this.history.shift();
    const counts = {};
    for (const h of this.history) {
      if (!h.label) continue;
      counts[h.label] = (counts[h.label] || 0) + 1;
    }
    let bestLabel = null;
    let bestCount = 0;
    for (const [l, c] of Object.entries(counts)) {
      if (c > bestCount) { bestLabel = l; bestCount = c; }
    }
    if (bestCount < this.minAgree) return { label: null, confidence: 0 };
    const confs = this.history.filter((h) => h.label === bestLabel).map((h) => h.confidence);
    return { label: bestLabel, confidence: confs.reduce((s, v) => s + v, 0) / confs.length };
  }

  clear() { this.history = []; }
}
