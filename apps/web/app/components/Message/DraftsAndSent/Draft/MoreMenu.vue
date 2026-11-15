<script setup lang="ts">
import type { DraftItem } from "#src/models/message/draftsAndSent/DraftItem";
import type { Item } from "#src/models/shared/Item";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { getDraftItemRoute } from "#src/services/message/draftsAndSent/getDraftItemRoute";
import { useDraftsAndSentScheduleDialogStore } from "#src/store/message/draftsAndSent/scheduleDialog";
import { useInputStore } from "#src/store/message/input/index";

interface Props {
  draftItem: DraftItem;
}

const { draftItem } = defineProps<Props>();
const inputStore = useInputStore();
const { clearComposer } = inputStore;
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
    :confirm-delete="() => clearComposer({ roomId: draftItem.room.id, threadRootId: draftItem.threadRootId })"
    delete-label="Delete draft"
    delete-message="Are you sure you want to delete this draft?"
    label="Draft actions"
  />
</template>
