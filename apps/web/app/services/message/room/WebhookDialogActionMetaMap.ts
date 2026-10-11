import { WebhookDialogAction } from "@/models/message/room/WebhookDialogAction";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

export const WebhookDialogActionMetaMap = {
  [WebhookDialogAction.Delete]: {
    confirmLabel: "Delete",
    label: "Delete webhook",
    meaning: UiIconMeaning.Delete,
    title: "Delete webhook",
  },
  [WebhookDialogAction.RotateToken]: {
    confirmLabel: "Rotate",
    label: "Rotate token",
    meaning: UiIconMeaning.Refresh,
    title: "Rotate token",
  },
} as const satisfies Record<
  WebhookDialogAction,
  { confirmLabel: string; label: string; meaning: UiIconMeaning; title: string }
>;
