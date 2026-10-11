import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import { WINDOW_RECUT_MARKER } from "#src/services/coderabbit/collect/constants";
import { getNewestMergedPullRequest } from "#src/services/coderabbit/collect/getNewestMergedPullRequest";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";

const FILE_CAP_REGEX = /cap:(?<fileCap>\d+)/u;
// The file cap each re-cut window's replacement is cut to, by the window's number, read off the marker the re-cut left
// On it (`recutWindowStack`). Only the closed windows above the newest merged one are read: a merge means a window
// Under that cap was reviewed, so every window after it is cut under the full cap again
export const readRecutFileCaps = (windowHistory: WindowPullRequest[], viewerLogin: string): Map<number, number> => {
  // A pull request's number is never 0, so with nothing merged every closed window is read
  const newestMergedNumber = getNewestMergedPullRequest(windowHistory) ?? 0;
  const recutFileCaps = new Map<number, number>();
  for (const { number, state } of windowHistory) {
    if (state !== WindowPullRequestState.Closed || number <= newestMergedNumber) continue;
    const marked = readEntries<GitHubEntry>(`issues/${number}/comments`).findLast((comment) =>
      checkIsMarked(comment, viewerLogin, WINDOW_RECUT_MARKER),
    );
    const fileCap = marked && FILE_CAP_REGEX.exec(marked.body)?.groups?.fileCap;
    if (fileCap) recutFileCaps.set(number, Number(fileCap));
  }
  return recutFileCaps;
};
