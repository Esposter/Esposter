<script setup lang="ts">
import type { DraftItem } from "@/models/message/draftsAndSent/DraftItem";

import { useDraftsAndSentScheduleDialogStore } from "@/store/message/draftsAndSent/scheduleDialog";

interface Props {
  draftItem: DraftItem;
}

const { draftItem } = defineProps<Props>();
const scheduleDialogStore = useDraftsAndSentScheduleDialogStore();
const { open } = scheduleDialogStore;
</script>

<template>
  <MessageDraftsAndSentActionButton
    icon="mdi-clock-plus-outline"
    text="Schedule message"
    @click="
      open({
        content: draftItem.content,
        roomId: draftItem.room.id,
        threadRootRowKey: draftItem.threadRootRowKey,
      })
    "
  />
</template>
