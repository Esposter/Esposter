import { z } from "zod";

export interface SlashCommand {
  argumentHint: string;
  description: string;
  name: string;
}

export const slashCommandSchema: z.ZodObject<{
  argumentHint: z.ZodString;
  description: z.ZodString;
  name: z.ZodString;
}> = z.object({
  argumentHint: z.string(),
  description: z.string(),
  name: z.string().min(1),
}) satisfies z.ZodType<SlashCommand>;
