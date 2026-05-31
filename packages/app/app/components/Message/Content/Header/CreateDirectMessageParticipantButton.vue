<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

interface CreateDirectMessageParticipantButtonProps {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<CreateDirectMessageParticipantButtonProps>();
const isOpen = ref(false);
</script>

<template>
  <v-tooltip location="bottom" text="Add People">
    <template #activator="{ props }">
      <v-btn icon="mdi-account-plus" size="small" :="props" @click="isOpen = true" />
    </template>
  </v-tooltip>
  <MessageContentHeaderCreateDirectMessageParticipantDialog v-model="isOpen" :room-id />
</template>
