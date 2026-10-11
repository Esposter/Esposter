import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getResult } from "@esposter/shared";
import { z } from "zod";

export interface SearchCandidate {
  chapters?: SearchChapter[];
  durationSeconds?: number;
  fps?: number;
  height?: number;
  title: string;
  uploadDate?: string;
  uploader?: string;
  url: string;
}

export interface SearchChapter {
  startSeconds: number;
  title: string;
}

const searchResultSchema = z.object({
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

// A field yt-dlp left out, or wrote as null, is left out of the candidate rather than carried as undefined
const toSearchCandidate = (result: z.infer<typeof searchResultSchema>): SearchCandidate => ({
  title: result.title,
  url: result.webpage_url,
  ...(result.chapters != null && {
    chapters: result.chapters.map((chapter) => ({ startSeconds: chapter.start_time, title: chapter.title })),
  }),
  ...(result.duration != null && { durationSeconds: result.duration }),
  ...(result.fps != null && { fps: result.fps }),
  ...(result.height != null && { height: result.height }),
  ...(result.uploader != null && { uploader: result.uploader }),
  ...(result.upload_date != null && {
    uploadDate: `${result.upload_date.slice(0, 4)}-${result.upload_date.slice(4, 6)}-${result.upload_date.slice(6)}`,
  }),
});

const parseSearchLine = (line: string): SearchCandidate | undefined =>
  getResult(() => parseMachineJson(line)).match(
    (json) => {
      const parsedResult = searchResultSchema.safeParse(json);
      return parsedResult.success ? toSearchCandidate(parsedResult.data) : undefined;
    },
    () => undefined,
  );

// The candidates in the JSON lines yt-dlp printed for a search. A line that is not JSON, or is JSON without a title and
// A URL, is skipped rather than failing the whole search
export const parseSearchCandidates = (output: string): SearchCandidate[] =>
  output.split("\n").flatMap((line) => parseSearchLine(line) ?? []);
