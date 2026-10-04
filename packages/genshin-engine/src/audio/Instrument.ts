// A voice's timbre and envelope, each value fitted to the sound it recreates. `harmonics` are the amplitudes of the
// Fundamental and each overtone above it, the fundamental's 1. A note rises linearly to its peak over `attack` seconds,
// Then settles toward `sustain`, a share of its peak, with `decay` its time constant in seconds, and once it ends fades
// With `release` its time constant. `level` is the fundamental's amplitude at the peak of a note of velocity 1, and
// `tuning` the semitones every pitch it plays sounds above equal temperament at A440, below it when negative
export interface Instrument {
  attack: number;
  decay: number;
  harmonics: number[];
  level: number;
  release: number;
  sustain: number;
  tuning: number;
}
