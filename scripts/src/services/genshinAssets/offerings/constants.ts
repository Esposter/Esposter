// The official map's label id of the Frostbearing Tree in Dragonspine, Mondstadt's, whose one point in Mondstadt's area is
// The tree's place
export const FROSTBEARING_TREE_LABEL_ID = 158;
// The offering ids of events that have ended, left out of the publish: Michiae Casket's, of the Three Realms Gateway
// Offering, a Version 2.5 flagship event that ran from 2022/02/17 to 2022/03/30
export const ENDED_OFFERING_IDS: ReadonlySet<number> = new Set([4]);
// Provisional, from the wiki's Primal Flame Resonance page: six levels of one Blazing Flint Ore each, the dump holding no
// Level table for it. Its bonuses are per constellation rather than items, so its levels pay no reward
export const BLAZING_FLINT_ORE_ITEM_ID = 918;
export const PRIMAL_FLAME_RESONANCE_LEVEL_COUNT = 6;
// The reward rows an offering's levels draw one set each from, by offering id, where its level table names no reward: the
// Gift of Amrita's six sets. Its level rows name a Lua group the dump does not hold, which draws among these rows. The
// Wiki's Rewards table gives the same six sets, matched to these rows by their item counts, not by item names
export const OFFERING_REWARD_POOL_IDS: ReadonlyMap<number, readonly number[]> = new Map([
  [6, [313_001, 313_002, 313_003, 313_004, 313_005, 313_006]],
]);
