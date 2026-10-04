import { MUSIC_EXPRESSION_WINDOW_SECONDS } from "#src/audio/constants";

const toAmplitude = (gain: number): number => 10 ** (gain / 20);
// A segment's expression scheduled on a gain from the segment's start on the audio clock: its first window's gain held
// To that window's centre, then an exponential ramp from each centre to the next, which moves evenly in decibels, and
// The last window's gain held past its centre. A segment with no expression plays at unity, and one of a single window
// Holds it without an event past its start, so a segment shorter than half a window leaves the next one's alone
export const scheduleMusicExpression = (gain: AudioParam, expression: number[], start: number): void => {
  const [first = 0, ...rest] = expression;
  gain.setValueAtTime(toAmplitude(first), start);
  if (rest.length === 0) return;
  gain.setValueAtTime(toAmplitude(first), start + MUSIC_EXPRESSION_WINDOW_SECONDS / 2);
  for (const [index, windowGain] of rest.entries())
    gain.exponentialRampToValueAtTime(toAmplitude(windowGain), start + (index + 1.5) * MUSIC_EXPRESSION_WINDOW_SECONDS);
};
