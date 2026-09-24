<script setup lang="ts">
import type { UiSelectItem } from "@/models/ui/UiSelectItem";
import type { RoomInMessage } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useRoomCategoryStore } from "@/store/message/roomCategory";
import { selectRoomInMessageSchema } from "@esposter/db-schema";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const saveRoom = useSaveRoom(() => room);
const readRoomCategories = useReadRoomCategories();
await readRoomCategories();

const roomCategoryStore = useRoomCategoryStore();
const { roomCategories } = storeToRefs(roomCategoryStore);
const editedCategoryId = ref(room.categoryId);
const editedIsReadOnly = ref(room.isReadOnly);
const editedSlowmodeMs = ref(room.slowmodeMs);
const editedTopic = ref(room.topic);
const categoryItems = computed<UiSelectItem<string>[]>(() => [
  { meaning: UiIconMeaning.None, title: "None (uncategorized)", value: "" },
  ...roomCategories.value.map(({ id, name }) => ({ meaning: UiIconMeaning.Folder, title: name, value: id })),
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

<!-- The panel's name is the header's, so the fields start at the top, one column across the panel -->
<template>
  <div py-4 flex flex-col gap-6 ui-body>
    <MessageModelRoomSettingsTypeOverviewCategoryField
      v-model="editedCategoryId"
      :items="categoryItems"
      @save="save()"
    />
    <MessageModelRoomSettingsTypeOverviewTopicField v-model="editedTopic" @save="save()" />
    <MessageModelRoomSettingsTypeOverviewSlowmodeField v-model="editedSlowmodeMs" @save="save()" />
    <MessageModelRoomSettingsTypeOverviewReadOnlyField v-model="editedIsReadOnly" @save="save()" />
  </div>
</template>
