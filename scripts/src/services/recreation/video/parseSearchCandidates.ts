import type { SearchCandidate } from "#src/models/recreation/video/SearchCandidate";

import { parseSearchLine } from "#src/services/recreation/video/parseSearchLine";

// The candidates in the JSON lines yt-dlp printed for a search. A line that is not JSON, or is JSON without a title and
// A URL, is skipped rather than failing the whole search
export const parseSearchCandidates = (output: string): SearchCandidate[] =>
  output.split("\n").flatMap((line) => parseSearchLine(line) ?? []);
