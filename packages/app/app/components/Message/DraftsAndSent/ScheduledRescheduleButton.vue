<script setup lang="ts">
import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";

import { getScheduledMessageJobText } from "@/services/message/draftsAndSent/getScheduledMessageJobText";
import { useDraftsAndSentScheduleDialogStore } from "@/store/message/draftsAndSent/scheduleDialog";

interface MessageDraftsAndSentScheduledRescheduleButtonProps {
  scheduledMessageJob: ScheduledMessageJobInMessageWithRoom;
}

const { scheduledMessageJob } = defineProps<MessageDraftsAndSentScheduledRescheduleButtonProps>();
const scheduleDialogStore = useDraftsAndSentScheduleDialogStore();
const { open } = scheduleDialogStore;
</script>

<template>
  <v-tooltip text="Reschedule message">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        :="tooltipProps"
        density="comfortable"
        icon="mdi-clock-edit-outline"
        size="small"
        variant="text"
        @click.stop="
          open({
            content: getScheduledMessageJobText(scheduledMessageJob),
            roomId: scheduledMessageJob.roomId,
            scheduledMessageJobId: scheduledMessageJob.id,
          })
        "
      />
    </template>
  </v-tooltip>
</template>
