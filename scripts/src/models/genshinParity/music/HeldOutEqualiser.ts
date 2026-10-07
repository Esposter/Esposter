// A fixed equaliser over a render, one gain an octave band in decibels fitted exactly in the score's measure: the
// Render's band distance as it stands, under the gains fitted over every frame, and under gains fitted on one half of
// Its frames in time and scored on the other, both ways round
export interface HeldOutEqualiser {
  distance: number;
  equalisedDistance: number;
  gains: number[];
  heldOutDistance: number;
}
