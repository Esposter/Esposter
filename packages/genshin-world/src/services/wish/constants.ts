import type { RarityRate } from "#src/models/wish/RarityRate";
import type { WishPity } from "#src/models/wish/WishPity";

// Capturing Radiance's published base rate is 0.018% a wish, a share of the five-star's 0.6%, so it triggers on 3% of the
// Character event five-stars the 50/50 decides, and on the next one for certain once the promotional character has come
// Second three times running
export const CAPTURING_RADIANCE_RATE = 0.03;
export const CAPTURING_RADIANCE_LOSS_LIMIT = 3;
// One Fate Point charts the next five-star to the Epitomized Path's weapon
export const FATE_POINT_LIMIT = 1;
// The larger of a wish's two sets
export const TEN_WISH_COUNT = 10;
// The beginners' wish ends after twenty wishes, its eighth draws its featured four-star, and ten cost eight Fates
export const BEGINNERS_WISH_LIMIT = 20;
export const BEGINNERS_GUARANTEED_WISH = 8;
export const BEGINNERS_TEN_WISH_COST = 8;
// A character's constellations, which its duplicates complete one each
export const CONSTELLATION_COUNT = 6;
// The Masterless Starglitter a duplicate character returns while its constellations are incomplete and once they are,
// And a weapon, at five stars and at four; and the Masterless Stardust of a three-star weapon
export const FIVE_STAR_DUPLICATE_STARGLITTER = 10;
export const FIVE_STAR_COMPLETE_STARGLITTER = 25;
export const FOUR_STAR_DUPLICATE_STARGLITTER = 2;
export const FOUR_STAR_COMPLETE_STARGLITTER = 5;
export const FIVE_STAR_WEAPON_STARGLITTER = 10;
export const FOUR_STAR_WEAPON_STARGLITTER = 2;
export const THREE_STAR_WEAPON_STARDUST = 15;
// The five-star's and the four-star's rates on every wish but the weapon wish, and on the weapon wish. The base rates
// And the hard pity are the game's published details; the soft pity is the community's model from millions of recorded
// Wishes, which the wiki publishes: the five-star rate climbs six points a wish from the 74th, or seven from the 63rd on
// The weapon wish, and the four-star rate 51 points at the 9th, or 60 at the 8th
export const WISH_FIVE_STAR_RATE: RarityRate = { base: 0.006, hardPity: 90, softPityStart: 74, softPityStep: 0.06 };
export const WISH_FOUR_STAR_RATE: RarityRate = { base: 0.051, hardPity: 10, softPityStart: 9, softPityStep: 0.51 };
export const WEAPON_WISH_FIVE_STAR_RATE: RarityRate = {
  base: 0.007,
  hardPity: 80,
  softPityStart: 63,
  softPityStep: 0.07,
};
export const WEAPON_WISH_FOUR_STAR_RATE: RarityRate = { base: 0.06, hardPity: 10, softPityStart: 8, softPityStep: 0.6 };
// A kind of wish's counters before its first wish
export const INITIAL_WISH_PITY: Readonly<WishPity> = {
  fatePoints: 0,
  fiveStarCount: 0,
  fourStarCount: 0,
  isFiveStarGuaranteed: false,
  isFourStarGuaranteed: false,
  lossCount: 0,
  wishCount: 0,
};
