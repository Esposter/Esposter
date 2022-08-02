<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";

const client = useClient();
const { currentRoomId, name, updateRoom } = useRoomStore();
const currentName = ref(name);
const titleRef = ref<HTMLDivElement | undefined>();
const titleHovered = ref(false);
const isEditMode = ref(false);
const onUpdateRoom = async () => {
  isEditMode.value = false;
  if (currentName.value !== name && currentRoomId) {
    const updatedRoom = await client.mutation("room.updateRoom", { id: currentRoomId, name: currentName.value });
    updateRoom(updatedRoom);
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
      <v-toolbar-title v-else font="bold!" @click="isEditMode = true">{{ currentName }}</v-toolbar-title>
    </div>
    <template #append>
      <v-btn icon="mdi-phone" size="small" />
      <v-btn icon="mdi-video" size="small" />
    </template>
  </v-toolbar>
</template>
