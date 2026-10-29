import { z } from "zod";

// Where a committed reference came from, each field omitted when nothing known names it: the recording file and the
// Second its frame was sampled at, its video's id and uploader, or the wiki page it was fetched from
export interface ParityReferenceAttribution {
  recording?: string;
  second?: number;
  uploader?: string;
  videoId?: string;
  wikiTitle?: string;
  wikiUrl?: string;
}

export const parityReferenceAttributionSchema: z.ZodType<ParityReferenceAttribution> = z.object({
  recording: z.string().min(1).optional(),
  second: z.number().nonnegative().optional(),
  uploader: z.string().min(1).optional(),
  videoId: z
    .string()
    .regex(/^[\w-]{11}$/u)
    .optional(),
  wikiTitle: z.string().min(1).optional(),
  wikiUrl: z.url().optional(),
});
