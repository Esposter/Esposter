import { UiToken } from "@/models/ui/UiToken";
import { UserStatus } from "@esposter/db-schema";

// The colour a status is drawn in, on the dot beside an avatar and the mark of its row in the picker
export const StatusTokenMap = {
  [UserStatus.DoNotDisturb]: UiToken.Error,
  [UserStatus.Idle]: UiToken.Warning,
  [UserStatus.Offline]: UiToken.Muted,
  [UserStatus.Online]: UiToken.Success,
} as const satisfies Record<UserStatus, UiToken>;
