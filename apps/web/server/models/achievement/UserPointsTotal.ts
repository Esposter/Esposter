import type { PointsLeaderboardEntry } from "#shared/models/achievement/PointsLeaderboardEntry";
import type { Except } from "type-fest";

// A user's summed points before they are ranked: a leaderboard entry without its rank
export type UserPointsTotal = Except<PointsLeaderboardEntry, "rank">;
