// @unocss-include
import { UserStatus } from "@esposter/db-schema";

export const StatusIconMap = {
  [UserStatus.DoNotDisturb]: "i-mdi:minus-circle",
  [UserStatus.Idle]: "i-mdi:moon-waning-crescent",
  [UserStatus.Offline]: "i-mdi:circle-outline",
  [UserStatus.Online]: "i-mdi:circle",
} as const satisfies Record<UserStatus, string>;
