import { z } from "zod";

// A terminal's size in character cells, as the page's terminal measures it
export interface TerminalSize {
  cols: number;
  rows: number;
}

export const terminalSizeSchema: z.ZodObject<{ cols: z.ZodInt; rows: z.ZodInt }> = z.object({
  cols: z.int().positive(),
  rows: z.int().positive(),
}) satisfies z.ZodType<TerminalSize>;
