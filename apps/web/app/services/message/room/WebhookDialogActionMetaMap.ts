import { WebhookDialogAction } from "@/models/message/room/WebhookDialogAction";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

export const WebhookDialogActionMetaMap = {
  [WebhookDialogAction.Delete]: {
    confirmLabel: "Delete",
    label: "Delete webhook",
    meaning: UiIconMeaning.Delete,
    title: "Delete webhook",
  },
  [WebhookDialogAction.Regenerate]: {
    confirmLabel: "Regenerate",
    label: "Regenerate URL",
    meaning: UiIconMeaning.Refresh,
    title: "Regenerate URL",
  },
} as const satisfies Record<
  WebhookDialogAction,
  { confirmLabel: string; label: string; meaning: UiIconMeaning; title: string }
>;
