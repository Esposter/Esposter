<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

const client = useClient();
const roomStore = useRoomStore();
const { updateRoom } = roomStore;
const { currentRoomId, roomName } = storeToRefs(roomStore);
const currentRoomName = ref(roomName.value);
const titleRef = ref<HTMLDivElement | undefined>();
const titleHovered = ref(false);
const isEditMode = ref(false);
const onUpdateRoom = async () => {
  try {
    if (!currentRoomId.value || !currentRoomName.value || currentRoomName.value === roomName.value) return;

    const updatedRoom = await client.mutation("room.updateRoom", {
      id: currentRoomId.value,
      name: currentRoomName.value,
    });
    updateRoom(updatedRoom);
  } finally {
    isEditMode.value = false;
    currentRoomName.value = roomName.value;
  }
};

onClickOutside(titleRef, async () => {
  if (isEditMode.value) await onUpdateRoom();
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
