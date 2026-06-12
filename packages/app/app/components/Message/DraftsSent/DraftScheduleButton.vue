<script setup lang="ts">
import type { DraftItem } from "@/models/message/draftsSent/DraftItem";

import { useDraftsSentScheduleDialogStore } from "@/store/message/draftsSent/scheduleDialog";

interface MessageDraftsSentDraftScheduleButtonProps {
  draftItem: DraftItem;
}

const { draftItem } = defineProps<MessageDraftsSentDraftScheduleButtonProps>();
const scheduleDialogStore = useDraftsSentScheduleDialogStore();
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
