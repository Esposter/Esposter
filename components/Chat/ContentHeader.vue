<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

const client = useClient();
const roomStore = useRoomStore();
const { currentRoomId, updateRoom } = roomStore;
const { name } = storeToRefs(roomStore);
const currentName = ref(name.value);
const titleRef = ref<HTMLDivElement | undefined>();
const titleHovered = ref(false);
const isEditMode = ref(false);
const onUpdateRoom = async () => {
  try {
    if (!currentRoomId || !currentName.value || currentName.value === name.value) return;

    const updatedRoom = await client.mutation("room.updateRoom", { id: currentRoomId, name: currentName.value });
    updateRoom(updatedRoom);
  } finally {
    isEditMode.value = false;
    currentName.value = name.value;
  }
};

useClickOutside(titleRef, async () => {
  if (isEditMode.value) await onUpdateRoom();
});
</script>

<template>
  <v-toolbar class="v-app-bar" tag="div" height="56" border>
    <div
      ref="titleRef"
      p="x-1"
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
        :model-value="currentName"
        @update:model-value="(value) => (currentName = value)"
        @keydown.enter="onUpdateRoom"
      />
      <v-toolbar-title v-else font="bold!" @click="isEditMode = true">{{ name }}</v-toolbar-title>
    </div>
    <template #append>
      <v-btn icon="mdi-phone" size="small" />
      <v-btn icon="mdi-video" size="small" />
    </template>
  </v-toolbar>
</template>
