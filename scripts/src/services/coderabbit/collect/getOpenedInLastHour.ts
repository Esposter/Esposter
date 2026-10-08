import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { WINDOW_OPENING_WINDOW_MS } from "#src/services/coderabbit/collect/constants";

// The window pull requests opened within the hour before `nowMs`, by their creation time, whatever their state now
export const getOpenedInLastHour = (windowPullRequests: WindowPullRequest[], nowMs: number): number =>
  windowPullRequests.filter(
    ({ createdAt }) => Temporal.Instant.from(createdAt).epochMilliseconds > nowMs - WINDOW_OPENING_WINDOW_MS,
  ).length;
