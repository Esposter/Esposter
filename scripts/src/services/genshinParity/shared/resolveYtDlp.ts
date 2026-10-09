import { YT_DLP_PINNED_TOOL } from "#src/services/genshinParity/shared/constants";
import { resolvePinnedTool } from "#src/services/shared/resolvePinnedTool";

// The pinned yt-dlp, fetched and checked the first time it is needed. Off Windows the yt-dlp on the PATH stands in,
// Which reads the same public videos
export const resolveYtDlp = (): Promise<string> =>
  process.platform === "win32" ? resolvePinnedTool(YT_DLP_PINNED_TOOL) : Promise.resolve("yt-dlp");
