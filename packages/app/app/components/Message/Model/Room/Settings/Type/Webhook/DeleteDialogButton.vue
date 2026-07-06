<script setup lang="ts">
import type { RoomInMessage, WebhookInMessage } from "@esposter/db-schema";

import { useWebhookStore } from "@/store/message/room/webhook";
import { withFinalizerAsync } from "@esposter/shared";

interface DeleteDialogButtonProps {
  roomId: RoomInMessage["id"];
  webhook: WebhookInMessage;
}

const { roomId, webhook } = defineProps<DeleteDialogButtonProps>();
const webhookStore = useWebhookStore();
const { deleteWebhook } = webhookStore;
</script>

<template>
  <StyledDeleteFormDialog
    :card-props="{ title: 'Delete Webhook', text: `Are you sure you want to delete ${webhook.name}?` }"
    @delete="
      async (onComplete) => {
        await withFinalizerAsync(() => deleteWebhook(roomId, { id: webhook.id }), onComplete);
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <StyledTooltipIconButton
        :button-props="{ size: 'small' }"
        icon="mdi-delete"
        text="Delete Webhook"
        @click="updateIsOpen(true)"
      />
    </template>
  </StyledDeleteFormDialog>
</template>
