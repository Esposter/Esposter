<script setup lang="ts">
import { useWebhookStore } from "@/store/message/webhook";

interface RotateTokenButtonProps {
  id: string;
}

const { id } = defineProps<RotateTokenButtonProps>();
const webhookStore = useWebhookStore();
const { rotateToken } = webhookStore;
</script>

<template>
  <v-tooltip text="Rotate Token">
    <template #activator="{ props }">
      <v-btn icon="mdi-refresh" size="small" :="props" @click="rotateToken({ id })" />
    </template>
  </v-tooltip>
</template>
