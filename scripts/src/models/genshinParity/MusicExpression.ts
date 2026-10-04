// The gain in decibels every band of a render takes together in each window of time from the start, to follow the
// Game's own swells and fades, the score's distance left at those gains, and the distance left in each band when the
// Gains are fitted to the other half of the bands, which stays near the first only while they are the music's loudness
// Rather than a band's balance
export interface MusicExpression {
  distance: number;
  heldOutDistance: number;
  windowGains: number[];
}
