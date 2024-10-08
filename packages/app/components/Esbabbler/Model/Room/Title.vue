<script setup lang="ts">
import { useRoomStore } from "@/store/esbabbler/room";

const roomStore = useRoomStore();
const { updateRoom } = roomStore;
const { currentRoomId, currentRoomName } = storeToRefs(roomStore);
const editedRoomName = ref(currentRoomName.value);
const isUpdateMode = ref(false);
const titleRef = ref<HTMLDivElement>();
const titleHovered = ref(false);
const onUpdateRoom = async () => {
  try {
    if (!currentRoomId.value || !editedRoomName.value || editedRoomName.value === currentRoomName.value) return;

    await updateRoom({
      id: currentRoomId.value,
      name: editedRoomName.value,
    });
  } finally {
    isUpdateMode.value = false;
    editedRoomName.value = currentRoomName.value;
  }
};

onClickOutside(titleRef, () => {
  if (isUpdateMode.value) void onUpdateRoom();
});
</script>

<template>
  <div
    ref="titleRef"
    flex
    items-center
    px-1
    :w="isUpdateMode ? 'full' : ''"
    :b="!isUpdateMode && titleHovered ? '1 solid' : '1 solid transparent'"
    rd
    @mouseenter="titleHovered = true"
    @mouseleave="titleHovered = false"
  >
    <v-text-field
      v-if="isUpdateMode"
      v-model="editedRoomName"
      density="compact"
      font-bold
      hide-details
      autofocus
      text-xl
      @keydown.enter="onUpdateRoom"
    />
    <v-toolbar-title v-else font-bold="!" select="all" @click="isUpdateMode = true">
      {{ currentRoomName }}
    </v-toolbar-title>
  </div>
</template>
