<script setup lang="ts">
import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";

import { getScheduledMessageJobText } from "@/services/message/draftsSent/getScheduledMessageJobText";
import { useDraftsSentScheduleDialogStore } from "@/store/message/draftsSent/scheduleDialog";

interface MessageDraftsSentScheduledRescheduleButtonProps {
  scheduledMessageJob: ScheduledMessageJobInMessageWithRoom;
}

const { scheduledMessageJob } = defineProps<MessageDraftsSentScheduledRescheduleButtonProps>();
const scheduleDialogStore = useDraftsSentScheduleDialogStore();
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
