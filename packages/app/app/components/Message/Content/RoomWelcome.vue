<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const roomName = useRoomName(() => room.id);
</script>

<template>
  <div ma-auto px-6 py-10 text-center flex flex-col gap-y-4 max-w-110 items-center>
    <StyledAvatar :image="room.image" :name="roomName" :avatar-props="{ size: 72 }" />
    <div flex flex-col gap-y-1>
      <h2 text-title-large>{{ roomName }}</h2>
      <div op-medium-emphasis>{{ room.topic || "No messages yet." }}</div>
    </div>
  </div>
</template>
