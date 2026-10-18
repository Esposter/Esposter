import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { z } from "zod";

// The attributes a piece's main affix may be: those the game's table lists for its slot that the wiki's distribution weighs,
// Since the table also lists attributes no piece rolls as its main affix. How often each rolls is the distribution's too
export interface ArtifactMainAffixPool {
  attributes: Attribute[];
  slot: ArtifactSlot;
}

export const artifactMainAffixPoolSchema = z.object({
  attributes: z.array(z.enum(Attribute)),
  slot: z.enum(ArtifactSlot),
}) satisfies z.ZodType<ArtifactMainAffixPool>;
