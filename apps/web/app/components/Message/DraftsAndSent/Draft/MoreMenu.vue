<script setup lang="ts">
import type { DraftItem } from "#src/models/message/draftsAndSent/DraftItem";
import type { Item } from "#src/models/shared/Item";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { getDraftItemRoute } from "#src/services/message/draftsAndSent/getDraftItemRoute";
import { useDraftsAndSentScheduleDialogStore } from "#src/store/message/draftsAndSent/scheduleDialog";

interface Props {
  draftItem: DraftItem;
}

const { draftItem } = defineProps<Props>();
const emit = defineEmits<{ delete: [] }>();
const draftsAndSentScheduleDialogStore = useDraftsAndSentScheduleDialogStore();
const { open } = draftsAndSentScheduleDialogStore;
const items = computed<Item[]>(() => [
  {
    meaning: UiIconMeaning.Edit,
    onClick: async () => {
      await navigateTo(getDraftItemRoute(draftItem));
    },
    title: "Edit draft",
  },
  {
    meaning: UiIconMeaning.Schedule,
    onClick: () => {
      open({ content: draftItem.content, roomId: draftItem.room.id, threadRootId: draftItem.threadRootId });
    },
    title: "Schedule message",
  },
]);
</script>

<template>
  <MessageDraftsAndSentMoreMenu
    :actions="items"
    delete-label="Delete draft"
    label="Draft actions"
    @delete="emit('delete')"
  />
</template>
