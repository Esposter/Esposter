import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { z } from "zod";

// The attributes a piece's main affix may be, as the game's table lists them for its slot. Which of them roll, and how
// Often, is the wiki's distribution and not the table's
export interface ArtifactMainAffixPool {
  attributes: Attribute[];
  slot: ArtifactSlot;
}

export const artifactMainAffixPoolSchema = z.object({
  attributes: z.array(z.enum(Attribute)),
  slot: z.enum(ArtifactSlot),
}) satisfies z.ZodType<ArtifactMainAffixPool>;
