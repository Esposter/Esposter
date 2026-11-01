import type { Aura } from "#src/models/combat/Aura";
import type { AuraType } from "#src/models/combat/AuraType";
import type { ElementalState } from "#src/models/combat/ElementalState";

import { createElementalState } from "#src/services/combat/aura/createElementalState";
import { describe } from "vitest";

// An elemental state holding the auras given, and nothing else of its own
export const createState = (auras: [AuraType, Aura][]): ElementalState => ({
  ...createElementalState(),
  auras: new Map(auras),
});

describe.todo("createState");
