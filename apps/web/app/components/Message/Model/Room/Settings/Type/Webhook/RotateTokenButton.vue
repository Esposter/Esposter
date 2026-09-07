<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useWebhookStore } from "@/store/message/room/webhook";

interface Props {
  id: string;
  roomId: RoomInMessage["id"];
}

const { id, roomId } = defineProps<Props>();
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
