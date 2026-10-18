import type { AttributeLine } from "#src/models/character/AttributeLine";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { attributeLineSchema } from "#src/models/character/AttributeLine";
import { MAX_MINOR_AFFIX_COUNT } from "#src/services/artifact/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// An artifact the player has: the set and the piece it is, its rarity in stars and its enhancement level from 0, the
// Attribute its main affix raises, at the value its rarity and level give, and its up to four minor affixes, each at
// The value its rolls summed to. Its experience is every EXP it has been levelled with, and a locked one is never fodder
export interface Artifact {
  experience: number;
  isLocked: boolean;
  level: number;
  mainAffix: Attribute;
  minorAffixes: AttributeLine[];
  rarity: number;
  setId: number;
  slot: ArtifactSlot;
}

// An artifact as a save holds it, the same shape a character's worn artifacts are saved in
export const artifactSchema = z.object({
  experience: z.int().nonnegative(),
  isLocked: z.boolean(),
  level: z.int().nonnegative(),
  mainAffix: z.enum(Attribute),
  minorAffixes: createUniqueArraySchema(attributeLineSchema, "attribute").max(MAX_MINOR_AFFIX_COUNT),
  rarity: z.int().positive(),
  setId: z.int().positive(),
  slot: z.enum(ArtifactSlot),
}) satisfies z.ZodType<Artifact>;
