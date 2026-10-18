import type { WishItem } from "#src/models/wish/WishItem";
import type { BannerKind } from "genshin-interface";

// One banner's pool: its id (its kind for the permanent banners, its schedule id for an event), its kind, its promotional five-stars and featured four-stars, and the rest of what it can draw at
// Each rarity. The beginners' wish features the four-star its eighth wish draws
export interface Banner {
  featuredFiveStars: WishItem[];
  featuredFourStars: WishItem[];
  fiveStars: WishItem[];
  fourStars: WishItem[];
  id: string;
  kind: BannerKind;
  threeStars: WishItem[];
}
