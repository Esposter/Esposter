<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const roomName = useRoomName(() => room.id);
</script>

<!-- The start of a room's history, aligned with the messages under it as a channel's first lines are -->
<template>
  <div px-4 py-8 flex flex-col gap-3>
    <UiAvatar :image="room.image" :name="roomName" is-large />
    <h2 ui-title>Welcome to {{ roomName }}</h2>
    <p text-muted>{{ room.topic || "No messages yet." }}</p>
  </div>
</template>
