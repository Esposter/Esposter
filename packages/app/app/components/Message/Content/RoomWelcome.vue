<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

interface RoomWelcomeProps {
  room: RoomInMessage;
}

const { room } = defineProps<RoomWelcomeProps>();
const roomName = useRoomName(() => room.id);
</script>

<template>
  <div ma-auto px-6 py-10 text-center flex flex-col max-w-110 items-center>
    <StyledAvatar :image="room.image" :name="roomName" :avatar-props="{ size: 72 }" />
    <h2 mt-4 text-title-large>{{ roomName }}</h2>
    <p v-if="room.topic" mb-0 mt-1 op-medium-emphasis>{{ room.topic }}</p>
    <p v-else mb-0 mt-1 op-medium-emphasis>No messages yet.</p>
  </div>
</template>
