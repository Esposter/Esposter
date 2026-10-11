import { VideoSite } from "#src/models/genshinParity/VideoSite";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The yt-dlp arguments printing the public videos a query finds, one JSON line each, with nothing downloaded. Not
// Flat, since the full JSON carries the height, frame rate, duration and chapters a candidate is picked by
export const getSearchArguments = (site: VideoSite, count: number, query: string): string[] => {
  if (!Number.isInteger(count) || count < 1)
    throw new InvalidOperationError(Operation.Read, query, `has no count of ${count}`);
  const searchPrefix = site === VideoSite.Bilibili ? "bilisearch" : "ytsearch";
  return ["--dump-json", "--skip-download", "--no-warnings", `${searchPrefix}${count}:${query}`];
};
