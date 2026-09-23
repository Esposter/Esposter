import { z } from "zod";

export interface Model {
  description: string;
  displayName: string;
  value: string;
}

export const modelSchema: z.ZodObject<{ description: z.ZodString; displayName: z.ZodString; value: z.ZodString }> =
  z.object({
    description: z.string(),
    displayName: z.string(),
    value: z.string().min(1),
  }) satisfies z.ZodType<Model>;
