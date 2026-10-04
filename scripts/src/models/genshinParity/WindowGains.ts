// The gain in decibels each octave band of a render would need to sound nearest the game's over one window of time,
// From its start in seconds
export interface WindowGains {
  gains: number[];
  start: number;
}
