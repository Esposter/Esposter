import { z } from "zod";

// The wiki's answer for a batch of titles, with each redirect it followed from a title the batch named
export const wikiRedirectResponseSchema = z.object({
  query: z.object({ redirects: z.array(z.object({ from: z.string(), to: z.string() })).optional() }),
});
