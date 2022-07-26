<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";

const client = useClient();
const { currentRoomId, name, updateRoom } = useRoomStore();
const currentName = ref(name);
const title = ref<HTMLDivElement | undefined>();
const titleHovered = ref(false);
const editMode = ref(false);
const sendName = async () => {
  editMode.value = false;
  if (currentName.value !== name && currentRoomId) {
    updateRoom(await client.mutation("room.updateRoom", { id: currentRoomId, name: currentName.value }));
  }
};

useClickOutside(title, async () => {
  if (editMode.value) await sendName();
});
</script>

<template>
  <v-toolbar class="v-app-bar" tag="div" height="56" border>
    <div
      ref="title"
      p="x-1"
      :w="editMode ? 'full' : ''"
      :b="!editMode && titleHovered ? '1 rd' : '1 rd transparent'"
      @mouseenter="titleHovered = true"
      @mouseleave="titleHovered = false"
    >
      <v-text-field
        v-if="editMode"
        font="bold"
        text="xl"
        density="compact"
        variant="solo"
        hide-details
        :model-value="currentName"
        @update:model-value="(value) => (currentName = value)"
        @keypress="
          (e) => {
            if (e.key === 'Enter') sendName();
          }
        "
      />
      <v-toolbar-title v-else font="bold!" @click="editMode = true">{{ currentName }}</v-toolbar-title>
    </div>
    <template #append>
      <v-btn icon="mdi-phone" size="small" />
      <v-btn icon="mdi-video" size="small" />
    </template>
  </v-toolbar>
</template>
