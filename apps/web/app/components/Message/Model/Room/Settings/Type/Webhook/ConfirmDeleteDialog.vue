<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useWebhookStore } from "@/store/message/room/webhook";
import { useWebhookDialogStore } from "@/store/message/room/webhookDialog";

interface Props {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<Props>();
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
  <UiConfirmDialog
    v-if="webhook"
    v-model="isOpen"
    confirm-label="Delete"
    title="Delete webhook"
    @confirm="
      async (onComplete) => {
        if (!webhook) return;
        const webhookId = webhook.id;
        onComplete();
        await deleteWebhook(roomId, { id: webhookId });
      }
    "
  >
    <p>Are you sure you want to delete {{ webhook.name }}?</p>
  </UiConfirmDialog>
</template>
