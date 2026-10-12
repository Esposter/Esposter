import type { LunarReactionType } from "#src/models/combat/LunarReactionType";
import type { MoonsignLevel } from "#src/models/combat/MoonsignLevel";

// What the deployed team's Moonsign makes of its reactions: the Base DMG Bonus its Benedictions add to each Lunar
// Reaction's damage, its level, none without a Moonsign character, the reactions its Benedictions turn Lunar, and the
// Reaction bonus its Ascendant Gleam adds to every Lunar damage while it is lit
export interface PartyMoonsign {
  baseDamageBonusMap: Partial<Record<LunarReactionType, number>>;
  level?: MoonsignLevel;
  lunarReactionTypes: LunarReactionType[];
  reactionBonus: number;
}
