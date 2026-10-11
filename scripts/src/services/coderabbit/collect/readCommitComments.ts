import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { readEntries } from "#src/services/coderabbit/shared/readEntries";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The record for a fact about one commit — its attempt markers, its held notice — read where `postCommitComment`
// Writes it. An empty sha is no commit at all, which is what a replay stop with no pick in progress names, so it is
// Refused here rather than read as `commits//comments`.
export const readCommitComments = (sha: string): GitHubEntry[] => {
  if (sha === "")
    throw new InvalidOperationError(
      Operation.Read,
      "coderabbit",
      "the comments of no commit: the replay ended with no pick in progress and a commit it owes not carried",
    );

  return readEntries(`commits/${sha}/comments`);
};
