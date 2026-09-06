import { z } from "zod";

export enum UserStatus {
  DoNotDisturb = "DoNotDisturb",
  Idle = "Idle",
  Offline = "Offline",
  Online = "Online",
}

export const userStatusSchema = z.enum(UserStatus) satisfies z.ZodType<UserStatus>;

export const UserStatuses: readonly UserStatus[] = Object.values(UserStatus);
