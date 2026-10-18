// One draw as the wish History panel lists it: the label of the banner it was drawn on, its item's name in the reader's
// Language and its rarity in stars, and the minute it was drawn at in the reader's time zone
export interface WishHistoryCell {
  bannerLabel: string;
  name: string;
  rarity: number;
  time: string;
}
