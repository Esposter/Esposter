import { z } from "zod";

// The wiki's answer for a batch of titles: each redirect it followed, from a title the batch named to the title it sends it to
export interface WikiRedirectResponse {
  query: { redirects?: undefined | { from: string; to: string }[] };
}

export const wikiRedirectResponseSchema: z.ZodType<WikiRedirectResponse> = z.object({
  query: z.object({ redirects: z.array(z.object({ from: z.string(), to: z.string() })).optional() }),
});
