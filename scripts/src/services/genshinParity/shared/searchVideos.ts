import type { VideoSite } from "#src/models/genshinParity/VideoSite";
import type { SearchCandidate } from "#src/services/genshinParity/shared/parseSearchCandidates";

import { getSearchArguments } from "#src/services/genshinParity/shared/getSearchArguments";
import { parseSearchCandidates } from "#src/services/genshinParity/shared/parseSearchCandidates";
import { resolveYtDlp } from "#src/services/genshinParity/shared/resolveYtDlp";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "node:child_process";

// The public videos a query finds on a site, the first count of them, read from yt-dlp's JSON lines without downloading
export const searchVideos = async (site: VideoSite, count: number, query: string): Promise<SearchCandidate[]> => {
  const searchArguments = getSearchArguments(site, count, query);
  const ytDlpPath = await resolveYtDlp();
  const { error, status, stdout } = spawnSync(ytDlpPath, searchArguments, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  if (status !== 0) throw new InvalidOperationError(Operation.Read, query, error?.message ?? `exited with ${status}`);
  return parseSearchCandidates(stdout);
};
