<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const roomName = useRoomName(() => room.id);
</script>

<template>
  <UiAvatar :image="room.image" :name="roomName" is-small />
  <span text-heading-color truncate>{{ roomName }}</span>
  <span v-if="room.topic" class="hidden sm:inline" text-muted truncate>{{ room.topic }}</span>
</template>
