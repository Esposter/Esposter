import { z } from "zod";

export interface Draft {
  content: string;
  updatedAt: Date;
}

export const draftSchema = z.object({
  content: z.string(),
  // Drafts are read back from localStorage with plain JSON.parse, so the persisted ISO string is
  // Coerced here rather than blanket-revived — a draft body that is itself an ISO datetime stays a string.
  updatedAt: z.coerce.date(),
}) satisfies z.ZodType<Draft>;
