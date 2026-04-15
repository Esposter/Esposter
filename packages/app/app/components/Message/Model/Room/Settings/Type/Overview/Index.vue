<script setup lang="ts">
import type { Room } from "@esposter/db-schema";

import { useRoomStore } from "@/store/message/room";
import { useRoomCategoryStore } from "@/store/message/roomCategory";

interface OverviewSettingsProps {
  roomId: Room["id"];
}

const { roomId } = defineProps<OverviewSettingsProps>();
const { $trpc } = useNuxtApp();
const { readRoomCategories } = useReadRoomCategories();
await readRoomCategories();

const roomCategoryStore = useRoomCategoryStore();
const { categories } = storeToRefs(roomCategoryStore);
const roomStore = useRoomStore();
const { storeUpdateRoom } = roomStore;
const { rooms } = storeToRefs(roomStore);
const room = computed(() => rooms.value.find(({ id }) => id === roomId));
const selectedCategoryId = ref(room.value?.categoryId ?? null);
const categoryItems = computed(() => [{ id: null, name: "None (uncategorized)" }, ...categories.value]);

const save = async () => {
  const updatedRoom = await $trpc.room.updateRoom.mutate({ categoryId: selectedCategoryId.value, id: roomId });
  storeUpdateRoom(updatedRoom);
};
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div text-lg font-bold>Overview</div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="8" md="6">
        <div font-semibold mb-1>Category</div>
        <v-select
          v-model="selectedCategoryId"
          :items="categoryItems"
          item-title="name"
          item-value="id"
          density="compact"
          hide-details
          @update:model-value="save()"
        />
        <div text-xs class="text-medium-emphasis" mt-1>Assign this room to a category to group it in the sidebar.</div>
      </v-col>
    </v-row>
  </v-container>
</template>
