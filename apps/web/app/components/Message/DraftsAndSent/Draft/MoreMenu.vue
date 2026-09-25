<script setup lang="ts">
import type { DraftItem } from "@/models/message/draftsAndSent/DraftItem";
import type { Item } from "@/models/shared/Item";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getDraftItemRoute } from "@/services/message/draftsAndSent/getDraftItemRoute";
import { useDraftsAndSentScheduleDialogStore } from "@/store/message/draftsAndSent/scheduleDialog";
import { useInputStore } from "@/store/message/input";

interface Props {
  draftItem: DraftItem;
}

const { draftItem } = defineProps<Props>();
const inputStore = useInputStore();
const { clearComposer } = inputStore;
const draftsAndSentScheduleDialogStore = useDraftsAndSentScheduleDialogStore();
const { open } = draftsAndSentScheduleDialogStore;
const isDeleteOpen = ref(false);
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
      open({ content: draftItem.content, roomId: draftItem.room.id, threadRootRowKey: draftItem.threadRootRowKey });
    },
    title: "Schedule message",
  },
  {
    isDanger: true,
    isGroupStart: true,
    meaning: UiIconMeaning.Delete,
    onClick: () => {
      isDeleteOpen.value = true;
    },
    title: "Delete draft",
  },
]);
</script>

<template>
  <UiOverflowMenu :items label="Draft actions" />
  <UiConfirmDialog
    v-if="isDeleteOpen"
    v-model="isDeleteOpen"
    confirm-label="Delete"
    title="Delete draft"
    @confirm="
      (onComplete) => {
        clearComposer({ roomId: draftItem.room.id, threadRootRowKey: draftItem.threadRootRowKey });
        onComplete();
      }
    "
  >
    <p>Are you sure you want to delete this draft?</p>
  </UiConfirmDialog>
</template>
