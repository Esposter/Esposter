<script setup lang="ts">
import type { RoomInMessage, WebhookInMessage } from "@esposter/db-schema";

import { useWebhookStore } from "@/store/message/webhook";

interface ActiveSwitchProps {
  roomId: RoomInMessage["id"];
  webhook: WebhookInMessage;
}

const { roomId, webhook } = defineProps<ActiveSwitchProps>();
const webhookStore = useWebhookStore();
const { updateWebhook } = webhookStore;
</script>

<template>
  <v-tooltip :text="webhook.isActive ? 'Deactivate Webhook' : 'Activate Webhook'">
    <template #activator="{ props }">
      <v-switch
        :model-value="webhook.isActive"
        color="primary"
        density="compact"
        hide-details
        :="props"
        @update:model-value="(value) => updateWebhook(roomId, { id: webhook.id, isActive: value ?? false })"
      />
    </template>
  </v-tooltip>
</template>
