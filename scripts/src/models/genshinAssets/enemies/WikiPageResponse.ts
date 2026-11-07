import { z } from "zod";

// The wiki's answer for its titles: each page with the main slot of its latest revision, which a missing title has none of
export interface WikiPageResponse {
  query: { pages: { missing?: true; revisions?: { slots: { main: { content: string } } }[] }[] };
}

export const wikiPageResponseSchema: z.ZodType<WikiPageResponse> = z.object({
  query: z.object({
    pages: z.array(
      z.object({
        missing: z.literal(true).optional(),
        revisions: z.array(z.object({ slots: z.object({ main: z.object({ content: z.string() }) }) })).optional(),
      }),
    ),
  }),
});
