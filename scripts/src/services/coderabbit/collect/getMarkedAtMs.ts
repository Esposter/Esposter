import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";

// When the collector wrote one marker, oldest first. How many is the count every capped step reads, and the instants are
// What a step that waits on its own record reads: the wait after a window's last ask, a red's attempts ageing out
export const getMarkedAtMs = (entries: GitHubEntry[], login: string, marker: string): number[] =>
  entries
    .filter((entry) => checkIsMarked(entry, login, marker))
    .map(({ updated_at }) => Date.parse(updated_at))
    .toSorted((firstMarkedAtMs, secondMarkedAtMs) => firstMarkedAtMs - secondMarkedAtMs);
