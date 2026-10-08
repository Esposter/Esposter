// What one wish drew, as the results show it: its name in the reader's language, its rarity in stars, whether Capturing
// Radiance made it the promotional character, and what it returned beside itself, "" for nothing
export interface WishResultCell {
  isCapturingRadiance: boolean;
  name: string;
  rarity: number;
  wishReturn: string;
}
