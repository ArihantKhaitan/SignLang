/**
 * Reference images for signs, per language, all served from /public/signs.
 *   ASL — Lifeprint animated GIFs (letters + a few numbers/phrases)
 *   BSL — skeleton diagrams rendered from the training data's median pose
 *   ISL — real photos from the training dataset
 */
export function signImage(lang, symbol) {
  const s = String(symbol).toLowerCase();
  if (lang === 'bsl') return `/signs/bsl/${s}.png`;
  if (lang === 'isl') return `/signs/isl/${s}.jpg`;
  // ASL: photo tiles for numbers (from Lifeprint's chart), animated GIFs for letters
  if (/^\d+$/.test(s)) return `/signs/asl-num/${s}.png`;
  return `/signs/${s}.gif`;
}

/** ASL phrase GIFs downloaded from Lifeprint (hello has none). */
export const PHRASE_GIFS = new Set([
  'thank-you', 'please', 'sorry', 'yes', 'no', 'help',
  'stop', 'good', 'love', 'water', 'where',
]);

export function phraseImage(name) {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  return PHRASE_GIFS.has(slug) ? `/signs/${slug}.gif` : null;
}
