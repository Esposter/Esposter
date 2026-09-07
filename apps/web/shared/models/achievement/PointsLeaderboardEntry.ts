import type { User } from "@esposter/db-schema";

// One ranked row of the points leaderboard: a user, their summed unlocked-achievement points, how many they have
// Unlocked, and their competition rank (users with equal points share a rank). Only the public identity columns are
// Carried — never email — mirroring the public-profile allowlist (readUser).
export interface PointsLeaderboardEntry {
  points: number;
  rank: number;
  unlockCount: number;
  user: Pick<User, "id" | "image" | "name">;
}
