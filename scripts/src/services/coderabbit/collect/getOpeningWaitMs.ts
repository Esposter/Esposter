import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { WINDOW_OPENING_WINDOW_MS } from "#src/services/coderabbit/collect/constants";

// How long until the hourly ceiling gives a slot back: the oldest window opened within the hour before `nowMs` ages
// Out of it then, and nothing is waited for when none was
export const getOpeningWaitMs = (windowPullRequests: WindowPullRequest[], nowMs: number): number => {
  const openedInHourMs = windowPullRequests
    .map(({ createdAt }) => Temporal.Instant.from(createdAt).epochMilliseconds)
    .filter((openedAtMs) => openedAtMs > nowMs - WINDOW_OPENING_WINDOW_MS);
  if (openedInHourMs.length === 0) return 0;
  return Math.min(...openedInHourMs) + WINDOW_OPENING_WINDOW_MS - nowMs;
};
