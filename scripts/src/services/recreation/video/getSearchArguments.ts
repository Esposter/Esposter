import { VideoSite } from "#src/models/recreation/video/VideoSite";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The yt-dlp arguments printing the public videos a query finds, one JSON line each, with nothing downloaded. The
// Template names only the fields a candidate is picked by: the full JSON carries every format of every result, which
// Overflows the buffer a search's output is read from
const SEARCH_PRINT_TEMPLATE = "%(.{webpage_url,title,uploader,duration,height,fps,upload_date,chapters})j";

export const getSearchArguments = (site: VideoSite, count: number, query: string): string[] => {
  if (!Number.isInteger(count) || count < 1)
    throw new InvalidOperationError(Operation.Read, query, `has no count of ${count}`);
  const searchPrefix = site === VideoSite.Bilibili ? "bilisearch" : "ytsearch";
  return ["--print", SEARCH_PRINT_TEMPLATE, "--skip-download", "--no-warnings", `${searchPrefix}${count}:${query}`];
};
