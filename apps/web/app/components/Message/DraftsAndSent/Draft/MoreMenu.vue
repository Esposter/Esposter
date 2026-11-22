<script setup lang="ts">
import type { DraftItem } from "#src/models/message/draftsAndSent/DraftItem";
import type { Item } from "#src/models/shared/Item";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { getDraftItemRoute } from "#src/services/message/draftsAndSent/getDraftItemRoute";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useDraftsAndSentScheduleDialogStore } from "#src/store/message/draftsAndSent/scheduleDialog";
import { getResultAsync, noop } from "@esposter/shared";

interface Props {
  draftItem: DraftItem;
}

const { draftItem } = defineProps<Props>();
const emit = defineEmits<{ delete: [] }>();
const draftsAndSentScheduleDialogStore = useDraftsAndSentScheduleDialogStore();
const { open } = draftsAndSentScheduleDialogStore;
const editDraft = async () => {
  await getResultAsync(() => navigateTo(getDraftItemRoute(draftItem))).match(noop, createErrorAlert);
};
const items = computed<Item[]>(() => [
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
    edit-label="Edit draft"
    label="Draft actions"
    @delete="emit('delete')"
    @edit="editDraft()"
  />
</template>
