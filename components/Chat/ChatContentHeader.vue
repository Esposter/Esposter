<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

const client = useClient();
const roomStore = useRoomStore();
const { updateName } = roomStore;
const { currentRoomId, name } = storeToRefs(roomStore);
const title = ref<HTMLDivElement | undefined>();
const editMode = ref(false);
const sendName = async () => {
  editMode.value = false;
  if (currentRoomId.value) await client.mutation("room.updateRoom", { id: currentRoomId.value, name: name.value });
};

useClickOutside(title, () => {
  if (editMode.value) editMode.value = false;
});
</script>

<template>
  <v-toolbar class="v-app-bar" tag="div" height="56" border>
    <div ref="title" :class="{ 'w-full': editMode }">
      <v-text-field
        v-if="editMode"
        density="compact"
        variant="solo"
        hide-details
        :model-value="name"
        @update:model-value="updateName"
        @keypress="
          (e) => {
            if (e.key === 'Enter') sendName();
          }
        "
      />
      <v-toolbar-title v-else font="bold!" @click="editMode = true">{{ name }}</v-toolbar-title>
    </div>
    <template #append>
      <v-btn icon="mdi-phone" size="small" />
      <v-btn icon="mdi-video" size="small" />
    </template>
  </v-toolbar>
</template>
