import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { getNewestWindowPullRequest } from "#src/services/coderabbit/collect/getNewestWindowPullRequest";
import { REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";

// The file cap the next window is cut to: the one a re-cut left on the newest window when that window was re-cut, so
// Its replacement is cut smaller, and the plan's cap otherwise
export const getWindowFileCap = (windowHistory: WindowPullRequest[], recutFileCaps: Map<number, number>): number => {
  const newestWindow = getNewestWindowPullRequest(windowHistory);
  return (newestWindow && recutFileCaps.get(newestWindow.number)) ?? REVIEW_FILE_CAP;
};
