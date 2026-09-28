import { z } from "zod";

export interface ShellId {
  shellId: string;
}

export const shellIdSchema: z.ZodObject<{ shellId: z.ZodString }> = z.object({
  shellId: z.string().min(1),
}) satisfies z.ZodType<ShellId>;
