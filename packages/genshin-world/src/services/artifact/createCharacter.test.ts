import type { Artifact } from "#src/models/artifact/Artifact";
import type { Character } from "#src/models/character/Character";

import { CombatTalent } from "#src/models/character/CombatTalent";
import { describe } from "vitest";

// A character of id one at level one wearing the artifacts given, with every talent and weapon at level one, as the
// Artifact suites hold one
export const createCharacter = (artifacts: Artifact[]): Character => ({
  artifacts,
  ascension: 0,
  constellationCount: 0,
  friendshipExp: 0,
  id: 1,
  level: 1,
  stellaFortunaCount: 0,
  talentLevels: { [CombatTalent.ElementalBurst]: 1, [CombatTalent.ElementalSkill]: 1, [CombatTalent.NormalAttack]: 1 },
  weapon: { ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 },
});

describe.todo("createCharacter");
