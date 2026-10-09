import { z } from "zod";

// A combat talent's labels at one level: the text id naming each parameter its description is written with, as the
// Game's proud skill row lists them, kept apart from the multipliers the combat table reads
export interface TalentLabel {
  level: number;
  paramDescTextIds: number[];
}

export const talentLabelSchema = z.object({
  level: z.int().positive(),
  paramDescTextIds: z.array(z.int().nonnegative()),
}) satisfies z.ZodType<TalentLabel>;
