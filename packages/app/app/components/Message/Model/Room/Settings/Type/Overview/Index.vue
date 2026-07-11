<script setup lang="ts">
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";
import type { RoomInMessage } from "@esposter/db-schema";

import { useRoomStore } from "@/store/message/room";
import { useRoomCategoryStore } from "@/store/message/roomCategory";
import { selectRoomInMessageSchema } from "@esposter/db-schema";

interface OverviewProps {
  room: RoomInMessage;
}

const { room } = defineProps<OverviewProps>();
const { $trpc } = useNuxtApp();
const roomStore = useRoomStore();
const { storeUpdateRoom } = roomStore;
const executeOptimisticMutation = useOptimisticMutation();
const { readRoomCategories } = useReadRoomCategories();
await readRoomCategories();

const roomCategoryStore = useRoomCategoryStore();
const { categories } = storeToRefs(roomCategoryStore);
const selectedCategoryId = ref(room.categoryId);
const isReadOnly = ref(room.isReadOnly);
const slowmodeMs = ref(room.slowmodeMs);
const topic = ref(room.topic);
const categoryItems = computed<SelectItemCategoryDefinition<null | string>[]>(() => [
  { title: "None (uncategorized)", value: null },
  ...categories.value.map(({ id, name }) => ({ title: name, value: id })),
]);
const isDirty = computed(
  () =>
    selectedCategoryId.value !== room.categoryId ||
    isReadOnly.value !== room.isReadOnly ||
    slowmodeMs.value !== room.slowmodeMs ||
    selectRoomInMessageSchema.shape.topic.safeParse(topic.value).data !== room.topic,
);
const save = async () => {
  if (!isDirty.value) return;
  const input = {
    categoryId: selectedCategoryId.value,
    id: room.id,
    isReadOnly: isReadOnly.value,
    slowmodeMs: slowmodeMs.value,
    topic: topic.value,
  };
  await executeOptimisticMutation(
    () => {
      const snapshot = {
        categoryId: room.categoryId,
        id: room.id,
        isReadOnly: room.isReadOnly,
        slowmodeMs: room.slowmodeMs,
        topic: room.topic,
      };
      storeUpdateRoom(input);
      return () => {
        storeUpdateRoom(snapshot);
      };
    },
    () => $trpc.room.updateRoom.mutate(input),
  );
};
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div font-bold text-title-medium>Overview</div>
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
