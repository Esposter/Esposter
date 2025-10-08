import type { VBadge } from "vuetify/components";

import { UserStatus } from "@esposter/db";

export const StatusBadgePropsMap = {
  [UserStatus.DoNotDisturb]: { color: "red" },
  [UserStatus.Idle]: { color: "yellow-darken-2" },
  [UserStatus.Offline]: { color: "grey" },
  [UserStatus.Online]: { color: "green" },
} as const satisfies Record<UserStatus, VBadge["$props"]>;
