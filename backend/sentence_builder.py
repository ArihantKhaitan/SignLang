"""
Accumulates single-letter sign predictions into words and sentences.

Flow:
  1. Call update(prediction, confidence) on every inference frame (~150 ms).
  2. A letter must be held for HOLD_SECONDS to be registered.
  3. Absence of a confident prediction for SPACE_SECONDS finalises the
     current word (adds a space).
  4. Special labels:
       "SPACE" → finishes current word
       "DEL"   → removes last character
  5. Use the UI buttons (backspace / space / clear) for explicit control.
"""

from __future__ import annotations
import time

HOLD_SECONDS   = 1.5   # seconds to hold a sign before it registers
SPACE_SECONDS  = 2.2   # silence duration to auto-add a space
MIN_CONFIDENCE = 0.75  # confidence threshold for a prediction to count


class SentenceBuilder:
    def __init__(self):
        self._reset_state()

    # ── Per-frame update ──────────────────────────────────────────────────

    def update(self, prediction: str, confidence: float):
        now = time.time()

        if prediction and confidence >= MIN_CONFIDENCE:
            self._last_confident_time = now

            if prediction == self._current_letter:
                elapsed = now - self._hold_start
                self.hold_progress = min(elapsed / HOLD_SECONDS, 1.0)

                if elapsed >= HOLD_SECONDS:
                    cooldown = HOLD_SECONDS * 1.3
                    if (self._last_registered != prediction or
                            now - self._last_registered_time > cooldown):
                        self._register(prediction)
                        self._hold_start = now          # restart hold
            else:
                self._current_letter = prediction
                self._hold_start = now
                self.hold_progress = 0.0
        else:
            self._current_letter = None
            self.hold_progress = 0.0

            gap = now - self._last_confident_time
            if gap >= SPACE_SECONDS and self.current_word:
                self._end_word()

    # ── UI controls ───────────────────────────────────────────────────────

    def backspace(self):
        if self.current_word:
            self.current_word = self.current_word[:-1]
        elif self._words:
            self._words.pop()

    def add_space(self):
        self._end_word()

    def clear(self):
        self._reset_state()

    # ── State accessor ────────────────────────────────────────────────────

    def get_state(self) -> dict:
        full = " ".join(self._words)
        if self.current_word:
            full = (full + " " + self.current_word).strip()
        return {
            "current_letter": self._current_letter,
            "hold_progress":  round(self.hold_progress, 3),
            "current_word":   self.current_word,
            "words":          list(self._words),
            "sentence":       " ".join(self._words),
            "full_text":      full,
        }

    # ── Internal ─────────────────────────────────────────────────────────

    def _reset_state(self):
        self._current_letter: str | None = None
        self._hold_start: float = time.time()
        self.hold_progress: float = 0.0
        self.current_word: str = ""
        self._words: list[str] = []
        self._last_confident_time: float = time.time()
        self._last_registered: str | None = None
        self._last_registered_time: float = 0.0

    def _register(self, letter: str):
        if letter == "SPACE":
            self._end_word()
        elif letter == "DEL":
            self.backspace()
        else:
            self.current_word += letter
        self._last_registered = letter
        self._last_registered_time = time.time()

    def _end_word(self):
        if self.current_word:
            self._words.append(self.current_word)
            self.current_word = ""
