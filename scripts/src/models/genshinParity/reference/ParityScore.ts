import type { LayerScore } from "#src/models/genshinParity/reference/LayerScore";

// How far one screen's shot stands from its reference: the mean difference over the compared region as a percentage,
// The share of the reference's edges it shares, the difference of their blurred colour as a percentage, and the mean
// FLIP error, the perceptual difference a screen is approved by, and a scene's layers scored apart, none for a screen
// No witness draws
export interface ParityScore {
  edgeScore: number;
  flip: number;
  layers: LayerScore[];
  meanDifference: number;
  screen: string;
  toneDifference: number;
}
