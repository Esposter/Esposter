// What one wish drew, as the results show it: its name in the reader's language, its rarity in stars, whether Capturing
// Radiance made it the promotional character, the Stella Fortuna it brought and what it returned beside itself, "" for nothing
export interface WishResultCell {
  isCapturingRadiance: boolean;
  name: string;
  rarity: number;
  stellaFortuna: string;
  wishReturn: string;
}
