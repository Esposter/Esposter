<script setup lang="ts">
import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";
import type { Item } from "@/models/shared/Item";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getScheduledMessageJobText } from "@/services/message/draftsAndSent/getScheduledMessageJobText";
import { useDraftsAndSentScheduleDialogStore } from "@/store/message/draftsAndSent/scheduleDialog";
import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";
import { ScheduledMessageJobType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";

interface Props {
  scheduledMessageJob: ScheduledMessageJobInMessageWithRoom;
}

const { scheduledMessageJob } = defineProps<Props>();
const scheduledMessageJobStore = useScheduledMessageJobStore();
const { cancelScheduledMessageJob } = scheduledMessageJobStore;
const cancelScheduledMessageJobToDraft = useCancelScheduledMessageJobToDraft();
const draftsAndSentScheduleDialogStore = useDraftsAndSentScheduleDialogStore();
const { open } = draftsAndSentScheduleDialogStore;
const items = computed<Item[]>(() => [
  {
    meaning: UiIconMeaning.Edit,
    onClick: async () => {
      await cancelScheduledMessageJobToDraft(scheduledMessageJob);
      await navigateTo(RoutePath.Messages(scheduledMessageJob.roomId));
    },
    title: "Edit scheduled message",
  },
  {
    meaning: UiIconMeaning.Schedule,
    // A reminder posts no message and so replies to nothing: only a scheduled message can belong to a thread, and
    // Rescheduling one has to keep it there
    onClick: () => {
      open({
        content: getScheduledMessageJobText(scheduledMessageJob),
        roomId: scheduledMessageJob.roomId,
        scheduledMessageJobId: scheduledMessageJob.id,
        threadRootRowKey:
          scheduledMessageJob.payload.type === ScheduledMessageJobType.ScheduledMessage
            ? scheduledMessageJob.payload.replyRowKey
            : "",
      });
    },
    title: "Reschedule message",
  },
  {
    meaning: UiIconMeaning.Save,
    onClick: async () => {
      await cancelScheduledMessageJobToDraft(scheduledMessageJob);
    },
    title: "Cancel schedule and save to drafts",
  },
]);
</script>

<template>
  <MessageDraftsAndSentMoreMenu
    :actions="items"
    :confirm-delete="() => cancelScheduledMessageJob(scheduledMessageJob.id)"
    delete-label="Delete message"
    delete-message="Are you sure you want to delete this scheduled message?"
    label="Scheduled message actions"
  />
</template>
