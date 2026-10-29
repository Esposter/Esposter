import type { SearchResult } from "#src/models/recreation/video/SearchResult";

import { z } from "zod";

export const searchResultSchema: z.ZodType<SearchResult> = z.object({
  chapters: z.array(z.object({ start_time: z.number(), title: z.string() })).nullish(),
  duration: z.number().nullish(),
  fps: z.number().nullish(),
  height: z.number().nullish(),
  title: z.string(),
  upload_date: z
    .string()
    .regex(/^\d{8}$/u)
    .nullish(),
  uploader: z.string().nullish(),
  webpage_url: z.string(),
});
