<script setup lang="ts">
import type { RoomInMessage, WebhookInMessage } from "@esposter/db-schema";

import { useWebhookStore } from "@/store/message/room/webhook";

interface WebhookActiveSwitchProps {
  roomId: RoomInMessage["id"];
  webhook: WebhookInMessage;
}

const { roomId, webhook } = defineProps<WebhookActiveSwitchProps>();
const webhookStore = useWebhookStore();
const { updateWebhook } = webhookStore;
</script>

<template>
  <v-tooltip :text="webhook.isActive ? 'Deactivate Webhook' : 'Activate Webhook'">
    <template #activator="{ props }">
      <v-switch
        :model-value="webhook.isActive"
        density="compact"
        :="props"
        @update:model-value="(value) => updateWebhook(roomId, { id: webhook.id, isActive: value ?? false })"
      />
    </template>
  </v-tooltip>
</template>
