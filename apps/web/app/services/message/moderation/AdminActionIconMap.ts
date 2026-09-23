// @unocss-include
import { AdminActionType } from "@esposter/db-schema";

export const AdminActionIconMap = {
  [AdminActionType.CreateBan]: "i-mdi:account-cancel",
  [AdminActionType.ForceMute]: "i-mdi:microphone-off",
  [AdminActionType.ForceUnmute]: "i-mdi:microphone",
  [AdminActionType.KickFromCall]: "i-mdi:headset-off",
  [AdminActionType.KickFromRoom]: "i-mdi:account-remove",
  [AdminActionType.SoftBan]: "i-mdi:account-arrow-left",
  [AdminActionType.StopScreenShare]: "i-mdi:monitor-off",
  [AdminActionType.TimeoutUser]: "i-mdi:clock-alert-outline",
  [AdminActionType.Warn]: "i-mdi:alert-circle-outline",
} as const satisfies Record<AdminActionType, string>;
