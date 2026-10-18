import type { WeightedValue } from "#src/models/shared/WeightedValue";

// The one-star weapons the wiki lists as dropping from Common and Exquisite chests, by their item ids: the weapon's id is
// Its item's. The wiki names no 2 or 3-star weapon, so none is listed beyond them
export const CHEST_ONE_STAR_WEAPON_ITEM_IDS: readonly number[] = [
  11101, 11201, 11301, 11303, 11305, 12101, 12201, 12303, 12306, 13101, 13201, 13301, 13302, 14101, 14201, 14303, 14305,
  15101, 15201, 15303, 15305,
];
// The artifact sets the wiki lists as dropping from every chest that gives artifacts, one to two stars, and the three
// Sets it lists beside them as three-star from Exquisite up. Set ids are the reliquary set table's
export const CHEST_LOW_RARITY_ARTIFACT_SET_IDS: readonly number[] = [10010, 10011, 10013];
export const CHEST_HIGH_RARITY_ARTIFACT_SET_IDS: readonly number[] = [10005, 10007, 10009];
// The stars a chest's artifact is drawn among by its set: one or two for a low set, and three for a high one
export const CHEST_LOW_RARITY_ARTIFACT_STARS: readonly number[] = [1, 2];
export const CHEST_HIGH_RARITY_ARTIFACT_STARS: readonly number[] = [3];
// The starting minor affix counts a chest's artifact is drawn among by its stars, each with its weight. The wiki's
// Artifact_Drop_Distribution gives these for an artifact a domain drops, its Domains row: two stars start with none at 80%
// And with one at 20%, three stars with one at 80% and with two at 20%. It names no chest row, so these are provisional.
// One star names no count, so it is taken to start with none
export const CHEST_INITIAL_MINOR_AFFIX_COUNT_WEIGHTS: Readonly<
  Partial<Record<number, readonly WeightedValue<number>[]>>
> = {
  1: [{ value: 0, weight: 1 }],
  2: [
    { value: 0, weight: 0.8 },
    { value: 1, weight: 0.2 },
  ],
  3: [
    { value: 1, weight: 0.8 },
    { value: 2, weight: 0.2 },
  ],
};
// The Character EXP materials by star, the one-star Wanderer's Advice, the two-star Adventurer's Experience and the
// Three-star Hero's Wit
export const CHARACTER_EXP_ONE_STAR_ITEM_ID = 104_001;
export const CHARACTER_EXP_TWO_STAR_ITEM_ID = 104_002;
export const CHARACTER_EXP_THREE_STAR_ITEM_ID = 104_003;
// The distance, in game units, within which an enemy camp or a puzzle not yet done locks a chest from being opened. The
// Wiki gives no distance, so this is provisional at twenty until the recording `chest-camp-lock.mkv` measures it
export const CHEST_LOCK_REACH = 20;
