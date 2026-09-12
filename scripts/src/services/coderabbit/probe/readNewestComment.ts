import type { GitHubEntry } from "#src/models/coderabbit/GitHubEntry";

import { getSortedByUpdatedAt } from "#src/services/coderabbit/getSortedByUpdatedAt";
import { readBotEntries } from "#src/services/coderabbit/readBotEntries";
import { getResult } from "@esposter/shared";

export const readNewestComment = (pullRequest: number): GitHubEntry | undefined =>
  getResult(() => getSortedByUpdatedAt(readBotEntries<GitHubEntry>(`issues/${pullRequest.toString()}/comments`)).at(-1))
    // A read that threw is not a checkpoint, and an empty reading is what says so downstream
    .unwrapOr(undefined);
