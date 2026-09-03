import type { PointsLeaderboardEntry } from "#shared/models/achievement/PointsLeaderboardEntry";

// The points leaderboard payload: the top-ranked entries plus the caller's own entry (with its global rank) so the
// Client can highlight the caller's row and append it when it falls outside the top window. `myEntry` is undefined when
// The caller is unauthenticated or has unlocked nothing.
export interface PointsLeaderboard {
  entries: PointsLeaderboardEntry[];
  myEntry?: PointsLeaderboardEntry;
}
