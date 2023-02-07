<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";

const { $client } = useNuxtApp();
const roomStore = useRoomStore();
const { updateRoom } = roomStore;
const { currentRoomId, roomName } = $(storeToRefs(roomStore));
const currentRoomName = ref(roomName);
let isUpdateMode = $ref(false);
const titleRef = ref<HTMLDivElement>();
const titleHovered = $ref(false);
const onUpdateRoom = async () => {
  try {
    if (!currentRoomId || !currentRoomName.value || currentRoomName.value === roomName) return;

    const updatedRoom = await $client.room.updateRoom.mutate({
      id: currentRoomId,
      name: currentRoomName.value,
    });
    if (updatedRoom) updateRoom(updatedRoom);
  } finally {
    isUpdateMode = false;
    currentRoomName.value = roomName;
  }
};

onClickOutside(titleRef, async () => {
  if (isUpdateMode) await onUpdateRoom();
});
</script>

<template>
  <div
    ref="titleRef"
    px="1"
    display="flex"
    items="center"
    :w="isUpdateMode ? 'full' : ''"
    :b="!isUpdateMode && titleHovered ? '1 solid rd' : '1 solid transparent rd'"
    @mouseenter="titleHovered = true"
    @mouseleave="titleHovered = false"
  >
    <v-text-field
      v-if="isUpdateMode"
      v-model="currentRoomName"
      font="bold"
      text="xl"
      density="compact"
      variant="solo"
      hide-details
      autofocus
      @keydown.enter="onUpdateRoom"
    />
    <v-toolbar-title v-else font="bold!" @click="isUpdateMode = true">{{ roomName }}</v-toolbar-title>
  </div>
</template>
