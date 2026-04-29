<script setup lang="ts">
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";
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
const isReadOnly = ref(room.value?.isReadOnly ?? false);
const slowmodeMs = ref(room.value?.slowmodeMs ?? null);
const topic = ref(room.value?.topic ?? "");
const categoryItems = computed<SelectItemCategoryDefinition<null | string>[]>(() => [
  { title: "None (uncategorized)", value: null },
  ...categories.value.map(({ id, name }) => ({ title: name, value: id })),
]);
const isChanged = computed(
  () =>
    selectedCategoryId.value !== (room.value?.categoryId ?? null) ||
    isReadOnly.value !== (room.value?.isReadOnly ?? false) ||
    slowmodeMs.value !== (room.value?.slowmodeMs ?? null) ||
    topic.value.trim() !== (room.value?.topic ?? ""),
);
const save = async () => {
  if (!isChanged.value) return;
  const updatedRoom = await $trpc.room.updateRoom.mutate({
    categoryId: selectedCategoryId.value,
    id: roomId,
    isReadOnly: isReadOnly.value,
    slowmodeMs: slowmodeMs.value,
    topic: topic.value.trim(),
  });
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
    <v-row>
      <v-col cols="12" md="6" sm="8">
        <MessageModelRoomSettingsTypeOverviewTopicField v-model="topic" @save="save()" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6" sm="8">
        <MessageModelRoomSettingsTypeOverviewSlowmodeField v-model="slowmodeMs" @save="save()" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6" sm="8">
        <MessageModelRoomSettingsTypeOverviewReadOnlyField v-model="isReadOnly" @save="save()" />
      </v-col>
    </v-row>
  </v-container>
</template>
