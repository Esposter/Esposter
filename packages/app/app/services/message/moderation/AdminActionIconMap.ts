import { AdminActionType } from "@esposter/db-schema";

export const AdminActionIconMap = {
  [AdminActionType.BanUser]: "mdi-account-cancel",
  [AdminActionType.ForceMute]: "mdi-microphone-off",
  [AdminActionType.ForceUnmute]: "mdi-microphone",
  [AdminActionType.KickFromRoom]: "mdi-account-remove",
  [AdminActionType.KickFromVoice]: "mdi-headset-off",
  [AdminActionType.TimeoutUser]: "mdi-clock-alert-outline",
} as const satisfies Record<AdminActionType, string>;
