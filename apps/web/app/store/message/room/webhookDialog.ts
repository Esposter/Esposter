import type { WebhookInMessage } from "@esposter/db-schema";
import type { Ref } from "vue";

import { WebhookDialogAction } from "@/models/message/room/WebhookDialogAction";

export const useWebhookDialogStore = defineStore("message/room/webhookDialog", () => {
  const deletingId = ref<WebhookInMessage["id"]>("");
  const rotatingId = ref<WebhookInMessage["id"]>("");
  const actionSelectedIdMap: Record<WebhookDialogAction, Ref<WebhookInMessage["id"]>> = {
    [WebhookDialogAction.Delete]: deletingId,
    [WebhookDialogAction.RotateToken]: rotatingId,
  };
  // The id an action's button picks and its confirm dialog reads, so the pair share one ref per action
  const getSelectedId = (action: WebhookDialogAction) => actionSelectedIdMap[action];
  return { getSelectedId };
});
