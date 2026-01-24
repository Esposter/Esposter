<script setup lang="ts">
import type { RoomInMessage, WebhookInMessage } from "@esposter/db-schema";

import { useWebhookStore } from "@/store/message/webhook";

interface DeleteDialogButtonProps {
  roomId: RoomInMessage["id"];
  webhook: WebhookInMessage;
}

const { roomId, webhook } = defineProps<DeleteDialogButtonProps>();
const webhookStore = useWebhookStore();
const { deleteWebhook } = webhookStore;
</script>

<template>
  <StyledDeleteDialog
    :card-props="{ title: 'Delete Webhook', text: `Are you sure you want to delete ${webhook.name}?` }"
    @delete="
      async (onComplete) => {
        try {
          deleteWebhook(roomId, { id: webhook.id });
        } finally {
          onComplete();
        }
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-tooltip text="Delete Webhook">
        <template #activator="{ props }">
          <v-btn icon="mdi-delete" size="small" :="props" @click="updateIsOpen(true)" />
        </template>
      </v-tooltip>
    </template>
  </StyledDeleteDialog>
</template>
