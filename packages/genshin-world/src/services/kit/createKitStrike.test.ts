import type { AttackTag } from "#src/models/combat/AttackTag";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { describe } from "vitest";

// A strike of the given kind by the combatant, at the origin with its kit's plunge collision as the hit
export const createKitStrike = (combatant: Combatant, attackTag: AttackTag): KitStrike => ({
  attackTag,
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  combatant,
  hit: combatant.kit.plungeCollision,
});

describe.todo("createKitStrike");
