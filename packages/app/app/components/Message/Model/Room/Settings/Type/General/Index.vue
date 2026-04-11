<script setup lang="ts">
import type { Room } from "@esposter/db-schema";

import { useRoomStore } from "@/store/message/room";
import { useRoomCategoryStore } from "@/store/message/roomCategory";

interface RoomSettingsGeneralProps {
  roomId: Room["id"];
}

const { roomId } = defineProps<RoomSettingsGeneralProps>();
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
  <div flex flex-col gap-6 max-w="480px">
    <div text-lg font-bold>General</div>
    <div flex flex-col gap-2>
      <div font-semibold>Category</div>
      <v-select
        v-model="selectedCategoryId"
        :items="categoryItems"
        item-title="name"
        item-value="id"
        density="compact"
        variant="outlined"
        hide-details
        @update:model-value="save()"
      />
      <div text-xs text-gray>Assign this room to a category to group it in the sidebar.</div>
    </div>
  </div>
</template>
