import { OutcropKind } from "genshin-world";

// The blossom refresh types of the two ley line kinds: a Revelation refreshes Character EXP materials, a Wealth Mora
export const LeyLineRefreshKindMap: Readonly<Record<string, OutcropKind>> = {
  BLOSSOM_REFRESH_EXP: OutcropKind.Revelation,
  BLOSSOM_REFRESH_SCOIN: OutcropKind.Wealth,
};
// The two conditions a kind opens by: the Adventure Rank it needs, and each nation whose area must be unlocked first
export const PLAYER_LEVEL_CONDITION_TYPE = "BLOSSOM_REFRESH_COND_PLAYER_LEVEL_EQUAL_GREATER";
export const AREA_UNLOCK_CONDITION_TYPE = "BLOSSOM_REFRESH_COND_UNLOCK_ANY_AREA_IN_CITY";
