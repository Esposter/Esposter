// How likely a wish is to draw a rarity: its base rate, the wish since the last of it from which the rate climbs and by
// How much a wish, and the wish that draws it for certain
export interface RarityRate {
  base: number;
  hardPity: number;
  softPityStart: number;
  softPityStep: number;
}
