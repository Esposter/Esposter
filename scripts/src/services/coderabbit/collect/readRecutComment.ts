import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import { WINDOW_RECUT_MARKER } from "#src/services/coderabbit/collect/constants";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";

// The marker a re-cut left on a window it closed (`closeRecutWindows`), the newest one when it was cut again more than
// Once: what says a closed window was given back to the opener rather than paused by a person
export const readRecutComment = (pullRequest: number, viewerLogin: string): GitHubEntry | undefined =>
  readEntries<GitHubEntry>(`issues/${pullRequest}/comments`).findLast((comment) =>
    checkIsMarked(comment, viewerLogin, WINDOW_RECUT_MARKER),
  );
