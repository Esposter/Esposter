import { AdminActionType } from "@esposter/db-schema";

export const AdminActionIconMap = {
  [AdminActionType.CreateBan]: "mdi-account-cancel",
  [AdminActionType.ForceMute]: "mdi-microphone-off",
  [AdminActionType.ForceUnmute]: "mdi-microphone",
  [AdminActionType.KickFromRoom]: "mdi-account-remove",
  [AdminActionType.KickFromVoice]: "mdi-headset-off",
  [AdminActionType.SoftBan]: "mdi-account-arrow-left",
  [AdminActionType.TimeoutUser]: "mdi-clock-alert-outline",
  [AdminActionType.Warn]: "mdi-alert-circle-outline",
} as const satisfies Record<AdminActionType, string>;
