import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { readEntries } from "#src/services/coderabbit/shared/readEntries";

// The record for a fact about one commit — its attempt markers, its held notice — read where `postCommitComment`
// Writes it
export const readCommitComments = (sha: string): GitHubEntry[] => readEntries<GitHubEntry>(`commits/${sha}/comments`);
