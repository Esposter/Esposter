import type { PointsLeaderboardEntry } from "#shared/models/achievement/PointsLeaderboardEntry";

// A user's summed points before they are ranked: a leaderboard entry without its rank
export type UserPointsTotal = Omit<PointsLeaderboardEntry, "rank">;
