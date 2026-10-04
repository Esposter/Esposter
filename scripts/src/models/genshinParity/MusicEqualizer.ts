// The gain in decibels each octave band of a render is raised by to sound nearest the game's, the score's distance left
// At those gains, and the distance left when each half of the frames is played at the gains the other half was fitted
// To, which stays near the first only while the gains are the render's balance rather than its frames'
export interface MusicEqualizer {
  distance: number;
  gains: number[];
  heldOutDistance: number;
}
