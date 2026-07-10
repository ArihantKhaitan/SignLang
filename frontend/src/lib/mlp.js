/**
 * Pure MLP math — no imports, so it can be unit-tested from Node directly.
 *
 * The feature pipeline MUST stay identical to the training script:
 *   1. center all 21 landmarks at the wrist (landmark 0)
 *   2. scale by the max 2D (x,y) distance from the wrist
 *   3. flatten landmarks 1..20 (wrist dropped — it is always the origin)
 */

export function normalizeLandmarks(landmarks, useZ) {
  const w = landmarks[0];
  let maxDist = 1e-6;
  for (let i = 1; i < 21; i++) {
    const dx = landmarks[i].x - w.x;
    const dy = landmarks[i].y - w.y;
    const d = Math.hypot(dx, dy);
    if (d > maxDist) maxDist = d;
  }
  const feats = [];
  for (let i = 1; i < 21; i++) {
    feats.push((landmarks[i].x - w.x) / maxDist);
    feats.push((landmarks[i].y - w.y) / maxDist);
    if (useZ) feats.push((landmarks[i].z - w.z) / maxDist);
  }
  return feats;
}

/**
 * Two-hand feature pipeline (BSL/ISL). MUST match two_hand_common.py:
 *   1. center = mean of the wrists of present hands
 *   2. scale  = max 2D distance from center over all present landmarks
 *   3. hands ordered by raw wrist x; single hand -> slot 0; absent slot stays zeros
 *   4. 2 slots x 21 landmarks x (x,y,z) -> 126 dims
 */
export function normalizeTwoHands(hands) {
  const present = hands.slice(0, 2);
  const feats = new Array(126).fill(0);
  if (present.length === 0) return feats;

  let cx = 0, cy = 0, cz = 0;
  for (const h of present) { cx += h[0].x; cy += h[0].y; cz += h[0].z; }
  cx /= present.length; cy /= present.length; cz /= present.length;

  let maxDist = 1e-6;
  for (const h of present) {
    for (const p of h) {
      const d = Math.hypot(p.x - cx, p.y - cy);
      if (d > maxDist) maxDist = d;
    }
  }

  const sorted = [...present].sort((a, b) => a[0].x - b[0].x);
  sorted.forEach((h, slot) => {
    for (let i = 0; i < 21; i++) {
      const base = slot * 63 + i * 3;
      feats[base] = (h[i].x - cx) / maxDist;
      feats[base + 1] = (h[i].y - cy) / maxDist;
      feats[base + 2] = (h[i].z - cz) / maxDist;
    }
  });
  return feats;
}

/** Forward pass: ReLU hidden layers, softmax output. Returns probabilities. */
export function mlpForward(model, feats) {
  let a = feats;
  const L = model.layers;
  for (let l = 0; l < L.length; l++) {
    const { weights, bias } = L[l];
    const out = new Array(weights.length);
    for (let o = 0; o < weights.length; o++) {
      let sum = bias[o];
      const row = weights[o];
      for (let i = 0; i < row.length; i++) sum += row[i] * a[i];
      out[o] = l < L.length - 1 ? Math.max(0, sum) : sum; // ReLU on hidden
    }
    a = out;
  }
  const m = Math.max(...a);
  const exps = a.map((v) => Math.exp(v - m));
  const total = exps.reduce((s, v) => s + v, 0);
  return exps.map((v) => v / total);
}
