<script setup lang="ts">
import type { RoomInMessage, WebhookInMessage } from "@esposter/db-schema";

import { useWebhookStore } from "@/store/message/room/webhook";

interface Props {
  roomId: RoomInMessage["id"];
  webhook: WebhookInMessage;
}

const { roomId, webhook } = defineProps<Props>();
const webhookStore = useWebhookStore();
const { updateWebhook } = webhookStore;
</script>

<template>
  <UiSwitch
    is-label-shown
    label="Active"
    :model-value="webhook.isActive"
    @update:model-value="(isActive) => updateWebhook(roomId, { id: webhook.id, isActive })"
  />
</template>
