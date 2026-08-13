<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useWebhookStore } from "@/store/message/room/webhook";
import { useWebhookDialogStore } from "@/store/message/room/webhookDialog";
import { withFinalizerAsync } from "@esposter/shared";

interface ConfirmDeleteDialogProps {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<ConfirmDeleteDialogProps>();
const webhookStore = useWebhookStore();
const { items } = storeToRefs(webhookStore);
const { deleteWebhook } = webhookStore;
const webhookDialogStore = useWebhookDialogStore();
const { deletingId } = storeToRefs(webhookDialogStore);
// Resolved through the primitive rather than a computed of our own, so a target whose webhook has left the
// List is dropped with it instead of re-opening this dialog by itself when a later read brings it back
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
