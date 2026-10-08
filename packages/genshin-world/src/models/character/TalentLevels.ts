import type { CombatTalent } from "#src/models/character/CombatTalent";

// The level each of a character's three combat talents is at, every one of them held
export type TalentLevels = Record<CombatTalent, number>;
