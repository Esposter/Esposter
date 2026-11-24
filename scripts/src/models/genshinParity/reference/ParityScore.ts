import type { LayerScore } from "#src/models/genshinParity/reference/LayerScore";

// How far one screen's shot stands from its reference: the mean difference over the compared region as a percentage,
// The share of the reference's edges it shares, the difference of their blurred colour as a percentage, and the mean
// FLIP error, the perceptual difference a screen is set against its bar by, and a scene's layers scored apart, none for
// A screen No witness draws, or for a scene whose layer pass could not run, so its layer rows stay as the report last
// Had them
export interface ParityScore {
  edgeScore: number;
  flip: number;
  layers?: LayerScore[] | undefined;
  meanDifference: number;
  screen: string;
  toneDifference: number;
}
