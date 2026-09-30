// How far one screen's shot stands from its reference: the mean difference over the compared region as a percentage,
// The share of the reference's edges it shares, and the difference of their blurred colour as a percentage
export interface ParityScore {
  edgeScore: number;
  meanDifference: number;
  screen: string;
  toneDifference: number;
}
