import type { WebhookInMessage } from "@esposter/db-schema";

export const useWebhookDialogStore = defineStore("message/room/webhookDialog", () => {
  const deletingId = ref<WebhookInMessage["id"]>("");
  return {
    deletingId,
  };
});
