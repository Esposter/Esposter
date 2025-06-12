import { UserStatus } from "#shared/models/db/user/UserStatus";

export const StatusColorMap = {
  [UserStatus.DoNotDisturb]: "red",
  [UserStatus.Idle]: "yellow",
  [UserStatus.Offline]: "gray",
  [UserStatus.Online]: "green",
} as const satisfies Record<UserStatus, string>;
