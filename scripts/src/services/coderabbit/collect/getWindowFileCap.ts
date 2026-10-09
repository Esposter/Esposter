import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { checkIsWindowBranch } from "#src/services/coderabbit/collect/checkIsWindowBranch";
import { getNewestWindowPullRequest } from "#src/services/coderabbit/collect/getNewestWindowPullRequest";
import { REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";

// The file cap the next window is cut to: the one a re-cut left on the newest window when that window was re-cut, so
// Its replacement is cut smaller, and the plan's cap otherwise. A re-cut's cap is for the windows it replaces, cut where
// They stood: a window re-cut from a stack holds the next one to it only while a window is still open below, and once
// None is, the replacement is cut from `main`, where no window below enters the bot's count. A window re-cut from
// `main` holds the next one to it with nothing open, since that is where its replacement stands too.
export const getWindowFileCap = (windowHistory: WindowPullRequest[], recutFileCaps: Map<number, number>): number => {
  const newestWindow = getNewestWindowPullRequest(windowHistory);
  if (newestWindow === undefined) return REVIEW_FILE_CAP;
  const isStackEmpty = windowHistory.every(({ state }) => state !== WindowPullRequestState.Open);
  if (isStackEmpty && checkIsWindowBranch(newestWindow.baseRefName)) return REVIEW_FILE_CAP;
  return recutFileCaps.get(newestWindow.number) ?? REVIEW_FILE_CAP;
};
