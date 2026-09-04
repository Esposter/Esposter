<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useWebhookStore } from "@/store/message/room/webhook";
import { useWebhookDialogStore } from "@/store/message/room/webhookDialog";
import { withFinalizerAsync } from "@esposter/shared";

interface WebhookConfirmDeleteDialogProps {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<WebhookConfirmDeleteDialogProps>();
const webhookStore = useWebhookStore();
const { items } = storeToRefs(webhookStore);
const { deleteWebhook } = webhookStore;
const webhookDialogStore = useWebhookDialogStore();
const { deletingId } = storeToRefs(webhookDialogStore);
const { isOpen, item: webhook } = useSingletonDialog(deletingId, () =>
  items.value.find(({ id }) => id === deletingId.value),
);
</script>

<template>
  <StyledDeleteFormDialog
    v-if="webhook"
    v-model="isOpen"
    :card-props="{ title: 'Delete Webhook' }"
    @delete="
      async (onComplete) => {
        if (!webhook) return;
        const webhookId = webhook.id;
        await withFinalizerAsync(() => deleteWebhook(roomId, { id: webhookId }), onComplete);
      }
    "
  >
    Are you sure you want to delete {{ webhook.name }}?
  </StyledDeleteFormDialog>
</template>
