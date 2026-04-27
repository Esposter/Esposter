<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useRoomStore } from "@/store/message/room";
import { useRoomCategoryStore } from "@/store/message/roomCategory";

interface OverviewProps {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<OverviewProps>();
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
      <v-col cols="12" md="6" sm="8">
        <MessageModelRoomSettingsTypeOverviewCategoryField
          v-model="selectedCategoryId"
          :items="categoryItems"
          @save="save()"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
