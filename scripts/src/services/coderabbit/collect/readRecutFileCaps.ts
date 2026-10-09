import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { getNewestMergedPullRequest } from "#src/services/coderabbit/collect/getNewestMergedPullRequest";
import { readRecutComment } from "#src/services/coderabbit/collect/readRecutComment";

const FILE_CAP_REGEX = /cap:(?<fileCap>\d+)/u;
// The file cap each re-cut window's replacement is cut to, by the window's number, read off the marker the re-cut left
// On it (`closeRecutWindows`). Only the closed windows above the newest merged one are read: a merge means a window
// Under that cap was reviewed, so every window after it is cut under the full cap again
export const readRecutFileCaps = (windowHistory: WindowPullRequest[], viewerLogin: string): Map<number, number> => {
  // A pull request's number is never 0, so with nothing merged every closed window is read
  const newestMergedNumber = getNewestMergedPullRequest(windowHistory) ?? 0;
  const recutFileCaps = new Map<number, number>();
  for (const { number, state } of windowHistory) {
    if (state !== WindowPullRequestState.Closed || number <= newestMergedNumber) continue;
    const marked = readRecutComment(number, viewerLogin);
    const fileCap = marked && FILE_CAP_REGEX.exec(marked.body)?.groups?.fileCap;
    if (fileCap) recutFileCaps.set(number, Number(fileCap));
  }
  return recutFileCaps;
};
