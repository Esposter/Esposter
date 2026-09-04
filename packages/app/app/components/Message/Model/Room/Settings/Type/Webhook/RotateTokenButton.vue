<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useWebhookStore } from "@/store/message/room/webhook";

interface WebhookRotateTokenButtonProps {
  id: string;
  roomId: RoomInMessage["id"];
}

const { id, roomId } = defineProps<WebhookRotateTokenButtonProps>();
const webhookStore = useWebhookStore();
const { rotateToken } = webhookStore;
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ size: 'small' }"
    icon="mdi-refresh"
    text="Rotate Token"
    @click="rotateToken(roomId, { id })"
  />
</template>
