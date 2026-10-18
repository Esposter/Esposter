import type { Artifact } from "#src/models/artifact/Artifact";
import type { TalentLevels } from "#src/models/character/TalentLevels";
import type { Weapon } from "#src/models/weapon/Weapon";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { attributeLineSchema } from "#src/models/character/AttributeLine";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { MAX_MINOR_AFFIX_COUNT } from "#src/services/artifact/constants";
import { CONSTELLATION_COUNT } from "#src/services/wish/constants";
import { MAX_WEAPON_REFINEMENT } from "#src/services/weapon/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// One character the player holds, as the save keeps it: how far it has grown, its weapon and its artifacts, each as the
// Model holds them, and the copies of it a wish has granted. Its Companionship EXP is kept by its id in the save beside
// The roster, so no copy of it is kept here
export interface CharacterSave {
  artifacts: Artifact[];
  ascension: number;
  constellationCount: number;
  copyCount: number;
  id: number;
  level: number;
  stellaFortunaCount: number;
  talentLevels: TalentLevels;
  weapon: Weapon;
}

export const characterSaveSchema = z.object({
  artifacts: createUniqueArraySchema(
    z.object({
      experience: z.int().nonnegative(),
      isLocked: z.boolean(),
      level: z.int().nonnegative(),
      mainAffix: z.enum(Attribute),
      minorAffixes: createUniqueArraySchema(attributeLineSchema, "attribute").max(MAX_MINOR_AFFIX_COUNT),
      rarity: z.int().positive(),
      setId: z.int().positive(),
      slot: z.enum(ArtifactSlot),
    }),
    "slot",
  ).max(Object.values(ArtifactSlot).length),
  ascension: z.int().nonnegative(),
  constellationCount: z.int().nonnegative().max(CONSTELLATION_COUNT),
  copyCount: z.int().nonnegative(),
  id: z.int().positive(),
  level: z.int().positive(),
  stellaFortunaCount: z.int().nonnegative(),
  talentLevels: z.record(z.enum(CombatTalent), z.int().positive()),
  weapon: z.object({
    ascension: z.int().nonnegative(),
    experience: z.int().nonnegative(),
    id: z.int().positive(),
    level: z.int().positive(),
    refinement: z.int().positive().max(MAX_WEAPON_REFINEMENT),
  }),
}) satisfies z.ZodType<CharacterSave>;
