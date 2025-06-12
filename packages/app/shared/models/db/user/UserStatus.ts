import { pgEnum } from "drizzle-orm/pg-core";

export enum UserStatus {
  DoNotDisturb = "DoNotDisturb",
  Idle = "Idle",
  Offline = "Offline",
  Online = "Online",
}

export const userStatusEnum = pgEnum("user_status", UserStatus);
