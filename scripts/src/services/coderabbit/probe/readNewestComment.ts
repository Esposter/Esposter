import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { getSortedByUpdatedAt } from "#src/services/coderabbit/shared/getSortedByUpdatedAt";
import { readBotEntries } from "#src/services/coderabbit/shared/readBotEntries";

// A failed read throws rather than reading as an empty pull request: the baseline the probe compares against
// Cannot tell the two apart, and a baseline of `""` makes the bot's existing comment look like the reply.
// The poll loop is the one caller that may tolerate a failure, and it wraps this itself.
export const readNewestComment = (pullRequest: number): GitHubEntry | undefined =>
  getSortedByUpdatedAt(readBotEntries<GitHubEntry>(`issues/${pullRequest.toString()}/comments`)).at(-1);
