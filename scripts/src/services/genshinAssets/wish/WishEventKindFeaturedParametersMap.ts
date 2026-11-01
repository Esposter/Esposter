import { WishEventKind } from "#src/models/genshinAssets/wish/WishEventKind";

// The Item Pool's parameters that name each kind of banner's featured five-stars and featured four-stars
export const WishEventKindFeaturedParametersMap: Record<WishEventKind, { fiveStar: string; fourStar: string }> = {
  [WishEventKind.CharacterEvent]: { fiveStar: "character_5_F", fourStar: "character_4_F" },
  [WishEventKind.WeaponEvent]: { fiveStar: "weapon_5_F", fourStar: "weapon_4_F" },
};
