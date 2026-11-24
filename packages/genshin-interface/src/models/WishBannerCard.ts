import type { TextSegment } from "#src/models/TextSegment";

// The open banner's card as the game words it: its name in colour runs, and the promoted five-star's title.
// Its rate-up line is the one the card's notice gives.
export interface WishBannerCard {
  featuredTitle: string;
  rateUp: string;
  title: TextSegment[];
}
