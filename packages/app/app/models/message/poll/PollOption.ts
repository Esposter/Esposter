import { z } from "zod";

export interface PollOption {
  id: string;
  label: string;
}

export const pollOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
}) satisfies z.ZodType<PollOption>;
