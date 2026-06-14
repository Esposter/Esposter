import { normalizeString } from "@esposter/shared";
import { z } from "zod";

export interface PollOption {
  id: string;
  label: string;
}

export const pollOptionSchema = z.object({
  id: z.uuid(),
  label: z.string().transform(normalizeString).pipe(z.string().min(1)),
}) satisfies z.ZodType<PollOption>;
