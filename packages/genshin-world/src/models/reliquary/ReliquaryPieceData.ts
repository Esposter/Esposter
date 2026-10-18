import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { z } from "zod";

// One piece of an artifact set as the game's reliquary table holds it: its item id, the text id of its name, its rank in
// Its tab, its rarity in stars and the slot it is worn in
export interface ReliquaryPieceData {
  itemId: number;
  nameTextId: string;
  rank: number;
  rarity: number;
  slot: ArtifactSlot;
}

export const reliquaryPieceDataSchema = z.object({
  itemId: z.int().positive(),
  nameTextId: z.string().min(1),
  rank: z.int().nonnegative(),
  rarity: z.int().positive(),
  slot: z.enum(ArtifactSlot) satisfies z.ZodType<ArtifactSlot>,
}) satisfies z.ZodType<ReliquaryPieceData>;
