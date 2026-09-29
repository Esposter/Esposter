import type { UserInAuth } from "@esposter/db-schema";

export interface UserPointsTotal {
  points: number;
  unlockCount: number;
  user: Pick<UserInAuth, "id" | "image" | "name">;
}
