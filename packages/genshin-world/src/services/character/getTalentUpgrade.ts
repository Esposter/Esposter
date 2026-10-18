import type { Character } from "#src/models/character/Character";
import type { CombatTalent } from "#src/models/character/CombatTalent";
import type { TalentUpgrade } from "#src/models/character/TalentUpgrade";

// The upgrade for the level above a combat talent's own, among a list of upgrades, or undefined where the list has none
export const getTalentUpgrade = (
  character: Character,
  talent: CombatTalent,
  upgrades: readonly TalentUpgrade[],
): TalentUpgrade | undefined => upgrades.find((candidate) => candidate.level === character.talentLevels[talent] + 1);
