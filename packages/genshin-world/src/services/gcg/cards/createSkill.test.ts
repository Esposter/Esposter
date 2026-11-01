import type { GcgSkill } from "#src/models/gcg/GcgSkill";
import type { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";

import { describe } from "vitest";

export const createSkill = (
  id: number,
  effect: string,
  kind: GcgSkillKind,
  costs: GcgSkill["costs"] = [],
): GcgSkill => ({ costs, effect, energyGain: 0, id, kind });

describe.todo("createSkill");
