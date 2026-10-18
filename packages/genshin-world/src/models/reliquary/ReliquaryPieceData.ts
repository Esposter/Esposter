import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { MAX_MINOR_AFFIX_COUNT } from "#src/services/artifact/constants";
import { z } from "zod";

// One piece of an artifact set as the game's reliquary table holds it: its item id, the text id of its name, its rank in
// Its tab, its rarity in stars, the slot it is worn in and how many minor affixes an artifact of it starts with. A set has
// One piece per slot, rarity and starting count, so the piece an artifact is named by is the one that matches all of them
export interface ReliquaryPieceData {
  itemId: number;
  nameTextId: string;
  rank: number;
  rarity: number;
  slot: ArtifactSlot;
  startingMinorCount: number;
}

export const reliquaryPieceDataSchema = z.object({
  itemId: z.int().positive(),
  nameTextId: z.string().min(1),
  rank: z.int().nonnegative(),
  rarity: z.int().positive(),
  slot: z.enum(ArtifactSlot) satisfies z.ZodType<ArtifactSlot>,
  startingMinorCount: z.int().nonnegative().max(MAX_MINOR_AFFIX_COUNT),
}) satisfies z.ZodType<ReliquaryPieceData>;
