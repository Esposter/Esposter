import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";

// Whether a skill is an Elemental Skill or an Elemental Burst.
// The cards that add to an elemental use's damage count the uses this check accepts.
export const checkIsGcgElementalUse = (skill: GcgSkill | undefined): boolean =>
  skill?.kind === GcgSkillKind.ElementalSkill || skill?.kind === GcgSkillKind.ElementalBurst;
