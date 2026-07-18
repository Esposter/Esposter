import type { PointsLeaderboard } from "#shared/models/achievement/PointsLeaderboard";
import type { PointsLeaderboardEntry } from "#shared/models/achievement/PointsLeaderboardEntry";
import type { AchievementName, User } from "@esposter/db-schema";

import { MAX_POINTS_LEADERBOARD_ENTRIES } from "#shared/services/achievement/constants";
import { AchievementDefinitionMap } from "#shared/services/achievement/achievementDefinitions";

interface UnlockedUserAchievementRow {
  achievement: { name: AchievementName };
  user: Pick<User, "id" | "image" | "name">;
  userId: string;
}

// Aggregate every unlocked user-achievement into a ranked leaderboard. Points live in the definition map, not the DB,
// So the summation happens here rather than in SQL. Ranking is competition-style — users with equal totals share a
// Rank (1 + the number of strictly higher totals) — matching a "COUNT(*) WHERE total > mine" caller-rank query. The
// Caller's own entry is always returned (with its global rank) so the client can highlight and append it when it
// Falls outside the top window; null when the caller is unauthenticated or has unlocked nothing.
export const buildPointsLeaderboard = (
  unlockedUserAchievements: readonly UnlockedUserAchievementRow[],
  callerUserId?: string,
): PointsLeaderboard => {
  const totals = new Map<string, { points: number; unlockCount: number; user: Pick<User, "id" | "image" | "name"> }>();
  for (const { achievement, user, userId } of unlockedUserAchievements) {
    const { points } = AchievementDefinitionMap[achievement.name];
    const existing = totals.get(userId);
    if (existing) {
      existing.points += points;
      existing.unlockCount += 1;
    } else totals.set(userId, { points, unlockCount: 1, user });
  }
  const ranked = [...totals.values()].sort(
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
    self: rankedEntries.find(({ user }) => user.id === callerUserId) ?? null,
  };
};
