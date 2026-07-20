import type { PointsLeaderboard } from "#shared/models/achievement/PointsLeaderboard";
import type { PointsLeaderboardEntry } from "#shared/models/achievement/PointsLeaderboardEntry";
import type { User } from "@esposter/db-schema";

import { MAX_POINTS_LEADERBOARD_ENTRIES } from "#shared/services/achievement/constants";

interface UserPointsTotal {
  points: number;
  unlockCount: number;
  user: Pick<User, "id" | "image" | "name">;
}

// Rank per-user totals pre-aggregated in SQL, so the working set is bounded by users rather than unlocks.
// Ranking is competition-style — users with equal totals share a rank (1 + the number of strictly higher
// Totals) — matching a "COUNT(*) WHERE total > mine" caller-rank query. The caller's own entry is always
// Returned (with its global rank) so the client can highlight and append it when it falls outside the top
// Window; undefined when the caller is unauthenticated or has unlocked nothing.
export const buildPointsLeaderboard = (
  userTotals: readonly UserPointsTotal[],
  callerUserId?: string,
): PointsLeaderboard => {
  const ranked = userTotals.toSorted(
    (first, second) =>
      second.points - first.points ||
      second.unlockCount - first.unlockCount ||
      first.user.name.localeCompare(second.user.name),
  );
  const rankedEntries: PointsLeaderboardEntry[] = [];
  let previousPoints = Number.NaN;
  let previousRank = 0;
  for (const [index, entry] of ranked.entries()) {
    const rank = entry.points === previousPoints ? previousRank : index + 1;
    previousPoints = entry.points;
    previousRank = rank;
    rankedEntries.push({ points: entry.points, rank, unlockCount: entry.unlockCount, user: entry.user });
  }
  return {
    entries: rankedEntries.slice(0, MAX_POINTS_LEADERBOARD_ENTRIES),
    self: rankedEntries.find(({ user }) => user.id === callerUserId),
  };
};
