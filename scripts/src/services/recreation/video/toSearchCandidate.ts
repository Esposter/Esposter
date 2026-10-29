import type { SearchCandidate } from "#src/models/recreation/video/SearchCandidate";
import type { SearchResult } from "#src/models/recreation/video/SearchResult";

// A field yt-dlp left out, or wrote as null, is left out of the candidate rather than carried as undefined
export const toSearchCandidate = (result: SearchResult): SearchCandidate => ({
  title: result.title,
  url: result.webpage_url,
  ...(Array.isArray(result.chapters) && {
    chapters: result.chapters.map((chapter) => ({ startSeconds: chapter.start_time, title: chapter.title })),
  }),
  ...(typeof result.duration === "number" && { durationSeconds: result.duration }),
  ...(typeof result.fps === "number" && { fps: result.fps }),
  ...(typeof result.height === "number" && { height: result.height }),
  ...(typeof result.uploader === "string" && { uploader: result.uploader }),
  ...(typeof result.upload_date === "string" && {
    uploadDate: `${result.upload_date.slice(0, 4)}-${result.upload_date.slice(4, 6)}-${result.upload_date.slice(6)}`,
  }),
});
