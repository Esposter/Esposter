<script setup lang="ts">
import type { Room } from "@esposter/db-schema";

import { useWebhookStore } from "@/store/message/webhook";

interface RotateTokenButtonProps {
  id: string;
  roomId: Room["id"];
}

const { id, roomId } = defineProps<RotateTokenButtonProps>();
const webhookStore = useWebhookStore();
const { rotateToken } = webhookStore;
</script>

<template>
  <v-tooltip text="Rotate Token">
    <template #activator="{ props }">
      <v-btn icon="mdi-refresh" size="small" :="props" @click="rotateToken(roomId, { id })" />
    </template>
  </v-tooltip>
</template>
