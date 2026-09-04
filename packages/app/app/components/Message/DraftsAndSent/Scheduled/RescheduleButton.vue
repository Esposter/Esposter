<script setup lang="ts">
import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";

import { getScheduledMessageJobText } from "@/services/message/draftsAndSent/getScheduledMessageJobText";
import { useDraftsAndSentScheduleDialogStore } from "@/store/message/draftsAndSent/scheduleDialog";
import { ScheduledMessageJobType } from "@esposter/db-schema";

interface Props {
  scheduledMessageJob: ScheduledMessageJobInMessageWithRoom;
}

const { scheduledMessageJob } = defineProps<Props>();
const scheduleDialogStore = useDraftsAndSentScheduleDialogStore();
const { open } = scheduleDialogStore;
</script>

<!-- A reminder posts no message and so replies to nothing — only a scheduled message can belong to a thread,
     and rescheduling one has to keep it there -->
<template>
  <MessageDraftsAndSentActionButton
    icon="mdi-clock-edit-outline"
    text="Reschedule message"
    @click="
      open({
        content: getScheduledMessageJobText(scheduledMessageJob),
        roomId: scheduledMessageJob.roomId,
        scheduledMessageJobId: scheduledMessageJob.id,
        threadRootRowKey:
          scheduledMessageJob.payload.type === ScheduledMessageJobType.ScheduledMessage
            ? scheduledMessageJob.payload.replyRowKey
            : '',
      })
    "
  />
</template>
