import type { VideoSite } from "#src/models/recreation/video/VideoSite";
import type { SearchCandidate } from "#src/services/recreation/video/parseSearchCandidates";

import { SEARCH_MAX_BUFFER_BYTES } from "#src/services/recreation/video/constants";
import { getSearchArguments } from "#src/services/recreation/video/getSearchArguments";
import { parseSearchCandidates } from "#src/services/recreation/video/parseSearchCandidates";
import { resolveYtDlp } from "#src/services/recreation/video/resolveYtDlp";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";

// The public videos a query finds on a site, the first count of them, read from yt-dlp's JSON lines without downloading
export const searchVideos = async (site: VideoSite, count: number, query: string): Promise<SearchCandidate[]> => {
  const searchArguments = getSearchArguments(site, count, query);
  const ytDlpPath = await resolveYtDlp();
  const { error, status, stdout } = spawnSync(ytDlpPath, searchArguments, {
    encoding: "utf8",
    maxBuffer: SEARCH_MAX_BUFFER_BYTES,
    stdio: ["ignore", "pipe", "inherit"],
  });
  if (status !== 0) throw new InvalidOperationError(Operation.Read, query, error?.message ?? `exited with ${status}`);
  return parseSearchCandidates(stdout);
};
