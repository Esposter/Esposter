<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRoomStore } from "@/store/useRoomStore";

const { $client } = useNuxtApp();
const roomStore = useRoomStore();
const { updateRoom } = roomStore;
const { currentRoomId, roomName } = storeToRefs(roomStore);
let currentRoomName = $ref(roomName.value);
let isEditMode = $ref(false);
const titleRef = ref<HTMLDivElement | undefined>();
const titleHovered = $ref(false);
const onUpdateRoom = async () => {
  try {
    if (!currentRoomId.value || !currentRoomName || currentRoomName === roomName.value) return;

    const { data } = await $client.room.updateRoom.mutate({
      id: currentRoomId.value,
      name: currentRoomName,
    });
    if (data.value) updateRoom(data.value);
  } finally {
    isEditMode = false;
    currentRoomName = roomName.value;
  }
};

onClickOutside(titleRef, async () => {
  if (isEditMode) await onUpdateRoom();
});
</script>

<template>
  <v-icon p="l-8" size="small">mdi-account-multiple</v-icon>
  <div
    ref="titleRef"
    m="x-3"
    p="x-1"
    display="flex"
    items="center"
    :w="isEditMode ? 'full' : ''"
    :b="!isEditMode && titleHovered ? '1 rd' : '1 rd transparent'"
    @mouseenter="titleHovered = true"
    @mouseleave="titleHovered = false"
  >
    <v-text-field
      v-if="isEditMode"
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
    <v-toolbar-title v-else font="bold!" @click="isEditMode = true">{{ roomName }}</v-toolbar-title>
  </div>
</template>
