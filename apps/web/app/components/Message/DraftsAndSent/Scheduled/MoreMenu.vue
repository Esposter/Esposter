<script setup lang="ts">
import type { ScheduledMessageJobWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobWithRoom";
import type { Item } from "#src/models/shared/Item";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { getScheduledMessageJobText } from "#src/services/message/draftsAndSent/getScheduledMessageJobText";
import { useDraftsAndSentScheduleDialogStore } from "#src/store/message/draftsAndSent/scheduleDialog";
import { useScheduledMessageJobStore } from "#src/store/message/scheduledMessageJob";
import { ScheduledMessageJobType } from "@esposter/db-schema";
import { getSynchronizedFunction, RoutePath } from "@esposter/shared";

interface Props {
  scheduledMessageJob: ScheduledMessageJobWithRoom;
}

const { scheduledMessageJob } = defineProps<Props>();
const scheduledMessageJobStore = useScheduledMessageJobStore();
const { cancelScheduledMessageJob } = scheduledMessageJobStore;
const cancelScheduledMessageJobToDraft = useCancelScheduledMessageJobToDraft();
const draftsAndSentScheduleDialogStore = useDraftsAndSentScheduleDialogStore();
const { open } = draftsAndSentScheduleDialogStore;
// Leaving for the room is at once, beside the cancel rather than after it
const navigateToRoom = getSynchronizedFunction(async () => {
  await navigateTo(RoutePath.Messages(scheduledMessageJob.roomId));
});
// Only a scheduled message reschedules, and it keeps the thread it was scheduled into. A reminder posts no message to
// Move, so it is set again instead
const threadRootId =
  scheduledMessageJob.payload.type === ScheduledMessageJobType.ScheduledMessage
    ? scheduledMessageJob.payload.replyToId || 0
    : 0;
const items = computed<Item[]>(() => [
  {
    meaning: UiIconMeaning.Edit,
    onClick: () => {
      // The job's text takes the room's composer as the cancel is sent, and the page goes there with it. A cancel the
      // Server refuses gives the job back and the composer its own text
      cancelScheduledMessageJobToDraft(scheduledMessageJob);
      navigateToRoom();
    },
    title: "Edit scheduled message",
  },
  ...(scheduledMessageJob.payload.type === ScheduledMessageJobType.ScheduledMessage
    ? [
        {
          meaning: UiIconMeaning.Schedule,
          onClick: () => {
            open({
              content: getScheduledMessageJobText(scheduledMessageJob),
              roomId: scheduledMessageJob.roomId,
              scheduledMessageJobId: scheduledMessageJob.id,
              threadRootId,
            });
          },
          title: "Reschedule message",
        },
      ]
    : []),
  {
    meaning: UiIconMeaning.Save,
    onClick: () => {
      cancelScheduledMessageJobToDraft(scheduledMessageJob);
    },
    title: "Cancel schedule and save to drafts",
  },
]);
</script>

<template>
  <MessageDraftsAndSentMoreMenu
    :actions="items"
    :confirm-delete="() => cancelScheduledMessageJob(scheduledMessageJob)"
    delete-label="Delete message"
    delete-message="Are you sure you want to delete this scheduled message?"
    label="Scheduled message actions"
  />
</template>
