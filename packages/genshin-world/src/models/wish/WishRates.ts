import type { RarityRate } from "#src/models/wish/RarityRate";

// A kind of wish's rates: the five-star's and the four-star's, and the share of each that is a featured item, none where
// The kind features nothing
export interface WishRates {
  featuredFiveStarShare: number;
  featuredFourStarShare: number;
  fiveStar: RarityRate;
  fourStar: RarityRate;
}
