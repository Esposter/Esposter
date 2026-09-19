import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";

// How many times the collector wrote one marker — the attempt count every capped step reads, whether its record
// Lives on the pull request or on the commit
export const getMarkedCount = (entries: GitHubEntry[], login: string, marker: string): number =>
  entries.filter((entry) => checkIsMarked(entry, login, marker)).length;
