import { UserStatus } from "@esposter/db-schema";

export const SelectableStatuses = [UserStatus.Online, UserStatus.Idle, UserStatus.DoNotDisturb] as const;
