import { z } from "zod";

// A subarea's label on the map as the open world's record holds it: the text id of its name, the level-one area it lies
// in and its own id in the game's area table, and the point its label sits at in the catalogue's axes. A subarea of
// several outlines is labelled once per outline, so a level-two id may repeat
export interface MapSubareaLabel {
  levelOneAreaId: number;
  levelTwoAreaId: number;
  nameTextId: string;
  x: number;
  z: number;
}

export const mapSubareaLabelSchema = z.object({
  levelOneAreaId: z.int().positive(),
  levelTwoAreaId: z.int().positive(),
  nameTextId: z.string().regex(/^\d+$/u),
  x: z.number(),
  z: z.number(),
}) satisfies z.ZodType<MapSubareaLabel>;
