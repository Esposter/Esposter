import { z } from "zod";

// What every line of a talk records: its id, the lines that may follow it, and its words by the game's text id
export interface BaseTalkLine {
  id: string;
  nextLineIds: string[];
  textId: string;
}

export const baseTalkLineSchema = z.object({
  id: z.string().min(1),
  nextLineIds: z.array(z.string().min(1)),
  textId: z.string().min(1),
}) satisfies z.ZodType<BaseTalkLine>;
