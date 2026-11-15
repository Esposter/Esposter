import { z } from "zod";

export const UserStatus = { DoNotDisturb: "DoNotDisturb", Idle: "Idle", Offline: "Offline", Online: "Online" } as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const userStatusSchema = z.enum(UserStatus) satisfies z.ZodType<UserStatus>;

export const UserStatuses: readonly UserStatus[] = Object.values(UserStatus);
