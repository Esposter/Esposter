<script setup lang="ts">
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";
import type { RoomInMessage } from "@esposter/db-schema";

import { useRoomCategoryStore } from "@/store/message/roomCategory";
import { selectRoomInMessageSchema } from "@esposter/db-schema";

interface OverviewProps {
  room: RoomInMessage;
}

const { room } = defineProps<OverviewProps>();
const saveRoom = useSaveRoom(() => room);
const readRoomCategories = useReadRoomCategories();
await readRoomCategories();

const roomCategoryStore = useRoomCategoryStore();
const { roomCategories } = storeToRefs(roomCategoryStore);
const editedCategoryId = ref(room.categoryId);
const editedIsReadOnly = ref(room.isReadOnly);
const editedSlowmodeMs = ref(room.slowmodeMs);
const editedTopic = ref(room.topic);
const categoryItems = computed<SelectItemCategoryDefinition<null | string>[]>(() => [
  { title: "None (uncategorized)", value: null },
  ...roomCategories.value.map(({ id, name }) => ({ title: name, value: id })),
]);
const isDirty = computed(
  () =>
    editedCategoryId.value !== room.categoryId ||
    editedIsReadOnly.value !== room.isReadOnly ||
    editedSlowmodeMs.value !== room.slowmodeMs ||
    selectRoomInMessageSchema.shape.topic.safeParse(editedTopic.value).data !== room.topic,
);
const save = async () => {
  if (!isDirty.value) return;

  await saveRoom({
    categoryId: editedCategoryId.value,
    isReadOnly: editedIsReadOnly.value,
    slowmodeMs: editedSlowmodeMs.value,
    topic: editedTopic.value,
  });
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
          v-model="editedCategoryId"
          :items="categoryItems"
          @save="save()"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6" sm="8">
        <MessageModelRoomSettingsTypeOverviewTopicField v-model="editedTopic" @save="save()" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6" sm="8">
        <MessageModelRoomSettingsTypeOverviewSlowmodeField v-model="editedSlowmodeMs" @save="save()" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6" sm="8">
        <MessageModelRoomSettingsTypeOverviewReadOnlyField v-model="editedIsReadOnly" @save="save()" />
      </v-col>
    </v-row>
  </v-container>
</template>
