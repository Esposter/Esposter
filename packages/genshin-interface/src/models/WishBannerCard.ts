import type { TextSegment } from "#src/models/TextSegment";

// The open banner's card as the game words it: the banner's name in its colour runs, the promoted five-star's title and the
// Rate-up line the card's notice gives
export interface WishBannerCard {
  featuredTitle: string;
  rateUp: string;
  title: TextSegment[];
}
