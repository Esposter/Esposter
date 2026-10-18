import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { listGcgTechniques } from "#src/services/gcg/effects/listGcgTechniques";

// The skills a character offers its side to use: its skills but its Passive ones, then the Techniques its equipment gives it
export const listGcgActiveSkills = (character: GcgCharacterState): GcgSkill[] => [
  ...character.character.skills.filter(({ kind }) => kind !== GcgSkillKind.Passive),
  ...listGcgTechniques(character),
];
