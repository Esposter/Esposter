import type { Combatant } from "#src/models/kit/Combatant";
import type { DeployedCombatant } from "#src/models/kit/DeployedCombatant";

import { describe } from "vitest";

// A deployed member as a passive reads it, for a test: the combatant given, holding no Energy unless the test gives it
// Some, on or off the field as the test says
export const createDeployedCombatant = (
  combatant: Combatant,
  { energy = 0, isOnField }: { energy?: number; isOnField: boolean },
): DeployedCombatant => ({ ...combatant, energy, isOnField });

describe.todo("createDeployedCombatant");
