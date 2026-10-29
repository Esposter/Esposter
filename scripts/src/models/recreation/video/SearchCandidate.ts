import type { SearchChapter } from "#src/models/recreation/video/SearchChapter";

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
