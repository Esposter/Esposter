<script setup lang="ts">
import type { DraftItem } from "@/models/message/draftsAndSent/DraftItem";

import { useDraftsAndSentScheduleDialogStore } from "@/store/message/draftsAndSent/scheduleDialog";

interface MessageDraftsAndSentDraftScheduleButtonProps {
  draftItem: DraftItem;
}

const { draftItem } = defineProps<MessageDraftsAndSentDraftScheduleButtonProps>();
const scheduleDialogStore = useDraftsAndSentScheduleDialogStore();
const { open } = scheduleDialogStore;
</script>

<template>
  <v-tooltip text="Schedule message">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        :="tooltipProps"
        density="comfortable"
        icon="mdi-clock-plus-outline"
        size="small"
        variant="text"
        @click.stop="open({ content: draftItem.content, roomId: draftItem.room.id })"
      />
    </template>
  </v-tooltip>
</template>
