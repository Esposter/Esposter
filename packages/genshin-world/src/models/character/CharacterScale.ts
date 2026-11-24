import { z } from "zod";

// The measured scale of one character's PMX: the game's own model's height in metres over the PMX's height in units.
// The metres one PMX unit stands for is the first over the second.
// The heights are kept beside it, so the record shows its own measure agrees with its unit.
export interface CharacterScale {
  metresPerUnit: number;
  modelHeightMetres: number;
  pmxHeightUnits: number;
}

// One record of the game data, under the key `characterModels/scale`: each measured character's scale by its id
export type CharacterScaleRecord = Record<string, CharacterScale>;

export const characterScaleSchema = z.object({
  metresPerUnit: z.number().positive(),
  modelHeightMetres: z.number().positive(),
  pmxHeightUnits: z.number().positive(),
}) satisfies z.ZodType<CharacterScale>;

export const characterScaleRecordSchema = z.record(
  z.string(),
  characterScaleSchema,
) satisfies z.ZodType<CharacterScaleRecord>;
