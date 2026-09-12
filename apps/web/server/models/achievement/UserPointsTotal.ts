import type { User } from "@esposter/db-schema";

export interface UserPointsTotal {
  points: number;
  unlockCount: number;
  user: Pick<User, "id" | "image" | "name">;
}
