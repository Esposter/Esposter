<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

interface Props {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<Props>();
const isOpen = ref(false);
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ size: 'small' }"
    icon="mdi-account-plus"
    text="Add People"
    :tooltip-props="{ location: 'bottom' }"
    @click="isOpen = true"
  />
  <MessageContentHeaderCreateDirectMessageParticipantDialog v-model="isOpen" :room-id />
</template>
