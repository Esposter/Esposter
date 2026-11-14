import type { PublicWebhookInMessage } from "@esposter/db-schema";

import { WebhookDialogAction } from "@/models/message/room/WebhookDialogAction";

export const useWebhookDialogStore = defineStore("message/room/webhookDialog", () => {
  const deletingId = ref<PublicWebhookInMessage["id"]>("");
  const regeneratingId = ref<PublicWebhookInMessage["id"]>("");
  const actionSelectedIdMap: Record<WebhookDialogAction, Ref<PublicWebhookInMessage["id"]>> = {
    [WebhookDialogAction.Delete]: deletingId,
    [WebhookDialogAction.Regenerate]: regeneratingId,
  };
  // The id an action's button picks and its confirm dialog reads, so the pair share one ref per action
  const getSelectedId = (action: WebhookDialogAction) => actionSelectedIdMap[action];
  // The URL of a webhook whose credential was just issued. It is held only until its dialog closes, since the server
  // Will not answer it again
  const issuedUrl = ref("");
  return { getSelectedId, issuedUrl };
});
