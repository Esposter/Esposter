import { z } from "zod";

export interface Draft {
  content: string;
  updatedAt: Date;
}

export const draftSchema = z.object({
  content: z.string(),
  updatedAt: z.date(),
}) satisfies z.ZodType<Draft>;
