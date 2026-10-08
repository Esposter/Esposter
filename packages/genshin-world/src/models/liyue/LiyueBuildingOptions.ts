// A Liyue building's footprint and storeys, in metres, its depth along z and its width along x
export interface LiyueBuildingOptions {
  depth: number;
  // One to three tiers of roof, each smaller than the one below and stacked on it
  roofTierCount: number;
  // From the terrace's top to the beams, the height of each column
  storeyHeight: number;
  width: number;
}
