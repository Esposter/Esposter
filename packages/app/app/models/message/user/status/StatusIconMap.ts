/* eslint-disable perfectionist/sort-objects */
import { UserStatus } from "@esposter/db-schema";

export const StatusIconMap = {
  [UserStatus.DoNotDisturb]: "mdi-minus-circle",
  [UserStatus.Idle]: "mdi-moon-waning-crescent",
  [UserStatus.Offline]: "mdi-circle-outline",
  [UserStatus.Online]: "mdi-circle",
} as const satisfies Record<UserStatus, string>;
