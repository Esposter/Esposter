import { z } from "zod";

// One artifact set as the game's reliquary set table holds it: its id, the text id of its name, the reliquary pieces it
// Is made of, and the counts of pieces its bonuses take, the two-piece and the four-piece bonus, in the table's order
export interface ReliquarySetData {
  id: number;
  nameTextId: string;
  needCounts: number[];
  pieceItemIds: number[];
}

export const reliquarySetDataSchema = z.object({
  id: z.int().positive(),
  nameTextId: z.string().min(1),
  needCounts: z.array(z.int().positive()).min(1),
  pieceItemIds: z.array(z.int().positive()).min(1),
}) satisfies z.ZodType<ReliquarySetData>;
