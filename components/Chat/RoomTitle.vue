<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

const { $client } = useNuxtApp();
const roomStore = useRoomStore();
const { updateRoom } = roomStore;
const { currentRoomId, roomName } = $(storeToRefs(roomStore));
let currentRoomName = $ref(roomName);
let isUpdateMode = $ref(false);
const titleRef = ref<HTMLDivElement | undefined>();
const titleHovered = $ref(false);
const onUpdateRoom = async () => {
  try {
    if (!currentRoomId || !currentRoomName || currentRoomName === roomName) return;

    const updatedRoom = await $client.room.updateRoom.mutate({
      id: currentRoomId,
      name: currentRoomName,
    });
    updateRoom(updatedRoom);
  } finally {
    isUpdateMode = false;
    currentRoomName = roomName;
  }
};

onClickOutside(titleRef, async () => {
  if (isUpdateMode) await onUpdateRoom();
});
</script>

<template>
  <v-icon p="l-8" size="small">mdi-account-multiple</v-icon>
  <div
    ref="titleRef"
    mx="3"
    px="1"
    display="flex"
    items="center"
    :w="isUpdateMode ? 'full' : ''"
    :b="!isUpdateMode && titleHovered ? '1 rd' : '1 rd transparent'"
    @mouseenter="titleHovered = true"
    @mouseleave="titleHovered = false"
  >
    <v-text-field
      v-if="isUpdateMode"
      font="bold"
      text="xl"
      density="compact"
      variant="solo"
      hide-details
      autofocus
      :model-value="currentRoomName"
      @update:model-value="(value) => (currentRoomName = value)"
      @keydown.enter="onUpdateRoom"
    />
    <v-toolbar-title v-else font="bold!" @click="isUpdateMode = true">{{ roomName }}</v-toolbar-title>
  </div>
</template>
