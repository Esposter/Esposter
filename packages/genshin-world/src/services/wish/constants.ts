import type { RarityRate } from "#src/models/wish/RarityRate";
import type { WishPity } from "#src/models/wish/WishPity";

// Capturing Radiance's published base rate is 0.018% a wish, a share of the five-star's 0.6%, so it triggers on 3% of the
// Character event five-stars the 50/50 decides, and on the next one for certain once the promotional character has come
// Second three times running
export const CAPTURING_RADIANCE_RATE = 0.03;
export const CAPTURING_RADIANCE_LOSS_LIMIT = 3;
// One Fate Point charts the next five-star to the Epitomized Path's weapon
export const FATE_POINT_LIMIT = 1;
// One Fate of a wish's kind bought with Primogems, the game's direct purchase
export const FATE_PRIMOGEM_COST = 160;
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
// The standard wish's characters by the game's ids, every one the wiki's Wanderlust Invocation lists that the stat
// Tables hold, in its order: Dehya, Diluc, Jean, Keqing, Mona, Qiqi, Tighnari and Yumemizuki Mizuki at five stars, then
// Aino, Amber, Barbara, Beidou, Bennett, Candace, Charlotte, Chevreuse, Chongyun, Collei, Dahlia, Diona, Dori, Faruzan,
// Fischl, Freminet, Gaming, Gorou, Iansan, Ifa, Illuga, Jahoda, Kachina, Kaeya, Kaveh, Kirara, Kujou Sara, Kuki
// Shinobu, Lan Yan, Layla, Lisa, Lynette, Mika, Ningguang, Noelle, Ororon, Prune, Razor, Rosaria, Sayu, Sethos,
// Shikanoin Heizou, Sucrose, Thoma, Xiangling, Xingqiu, Xinyan, Yanfei, Yaoyao and Yun Jin at four
export const STANDARD_WISH_CHARACTER_IDS: readonly number[] = [
  10_000_079, 10_000_016, 10_000_003, 10_000_042, 10_000_041, 10_000_035, 10_000_069, 10_000_109, 10_000_121,
  10_000_021, 10_000_014, 10_000_024, 10_000_032, 10_000_072, 10_000_088, 10_000_090, 10_000_036, 10_000_067,
  10_000_115, 10_000_039, 10_000_068, 10_000_076, 10_000_031, 10_000_085, 10_000_092, 10_000_055, 10_000_110,
  10_000_113, 10_000_127, 10_000_124, 10_000_100, 10_000_015, 10_000_081, 10_000_061, 10_000_056, 10_000_065,
  10_000_108, 10_000_074, 10_000_006, 10_000_083, 10_000_080, 10_000_027, 10_000_034, 10_000_105, 10_000_132,
  10_000_020, 10_000_045, 10_000_053, 10_000_097, 10_000_059, 10_000_043, 10_000_050, 10_000_023, 10_000_025,
  10_000_044, 10_000_048, 10_000_077, 10_000_064,
];
// The standard wish's weapons by the game's ids, as the wiki lists them: Amos' Bow, Aquila Favonia, Lost Prayer to the
// Sacred Winds, Primordial Jade Winged-Spear, Skyward Atlas, Skyward Blade, Skyward Harp, Skyward Pride, Skyward Spine
// And Wolf's Gravestone at five stars; Dragon's Bane, Eye of Perception, the five Favonius weapons, Lion's Roar,
// Rainslasher, Rust, the four Sacrificial weapons, The Bell, The Flute, The Stringless and The Widsith at four; and
// Black Tassel, Bloodtainted Greatsword, Cool Steel, Debate Club, Emerald Orb, Ferrous Shadow, Harbinger of Dawn, Magic
// Guide, Raven Bow, Sharpshooter's Oath, Skyrider Sword, Slingshot and Thrilling Tales of Dragon Slayers at three
export const STANDARD_WISH_WEAPON_IDS: readonly number[] = [
  15_502, 11_501, 14_502, 13_505, 14_501, 11_502, 15_501, 12_501, 13_502, 12_502, 13_401, 14_409, 14_401, 12_401,
  13_407, 11_401, 15_401, 11_405, 12_405, 15_405, 15_403, 14_403, 12_403, 11_403, 12_402, 11_402, 15_402, 14_402,
  13_303, 12_302, 11_301, 12_305, 14_304, 12_301, 11_302, 14_301, 15_301, 15_302, 11_306, 15_304, 14_302,
];
// The beginners' wish's characters by the game's ids, as the wiki lists them: Diluc, Jean, Keqing, Mona and Qiqi at
// Five stars, and Barbara, Beidou, Bennett, Chongyun, Fischl, Ningguang, Razor, Sucrose, Xiangling and Xingqiu at four.
// Its weapons are the standard wish's three-stars alone, and Noelle comes from its eighth wish and no other
export const BEGINNERS_WISH_CHARACTER_IDS: readonly number[] = [
  10_000_016, 10_000_003, 10_000_042, 10_000_041, 10_000_035, 10_000_014, 10_000_024, 10_000_032, 10_000_036,
  10_000_031, 10_000_027, 10_000_020, 10_000_043, 10_000_023, 10_000_025,
];
export const BEGINNERS_WISH_FEATURED_CHARACTER_ID = 10_000_034;
