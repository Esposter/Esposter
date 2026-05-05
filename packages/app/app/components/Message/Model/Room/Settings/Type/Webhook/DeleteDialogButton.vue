<script setup lang="ts">
import type { RoomInMessage, WebhookInMessage } from "@esposter/db-schema";

import { withFinalizer } from "#shared/error/withFinalizer";
import { useWebhookStore } from "@/store/message/room/webhook";

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
        await withFinalizer(() => deleteWebhook(roomId, { id: webhook.id }), onComplete);
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
  </StyledDeleteFormDialog>
</template>
