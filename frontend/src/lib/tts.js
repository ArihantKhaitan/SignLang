/** Browser text-to-speech via the Web Speech API — no backend needed. */
export function speak(text, { rate = 0.95 } = {}) {
  if (!text || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = rate;
  window.speechSynthesis.speak(u);
}
