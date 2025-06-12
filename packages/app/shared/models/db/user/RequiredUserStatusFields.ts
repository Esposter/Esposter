import type { IUserStatus } from "#shared/db/schema/userStatuses";

export type RequiredUserStatusFields = Extract<"status" | "userId", keyof IUserStatus>;
