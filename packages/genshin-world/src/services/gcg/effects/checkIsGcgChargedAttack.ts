import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";

// Whether a skill a side uses is a Charged Attack: a Normal Attack, on a round whose Elemental Dice were even in number
// Before its Action Phase
export const checkIsGcgChargedAttack = (side: GcgSideState, skill: GcgSkill | undefined): boolean =>
  skill?.kind === GcgSkillKind.NormalAttack && side.hasChargedAttack === true;
