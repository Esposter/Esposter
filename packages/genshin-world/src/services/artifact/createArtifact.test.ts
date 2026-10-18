import type { Artifact } from "#src/models/artifact/Artifact";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { describe } from "vitest";

// A five-star flower piece of set one at level zero with no minor affix, its fields set by overrides
export const createArtifact = (overrides: Partial<Artifact> = {}): Artifact => ({
  experience: 0,
  isLocked: false,
  itemId: 101,
  level: 0,
  mainAffix: Attribute.Health,
  minorAffixes: [],
  rarity: 5,
  setId: 1,
  slot: ArtifactSlot.FlowerOfLife,
  ...overrides,
});

describe.todo("createArtifact");
