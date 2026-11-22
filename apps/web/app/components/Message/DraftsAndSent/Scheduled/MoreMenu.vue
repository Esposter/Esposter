<script setup lang="ts">
import type { ScheduledMessageJobWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobWithRoom";
import type { Item } from "#src/models/shared/Item";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { getScheduledMessageJobText } from "#src/services/message/draftsAndSent/getScheduledMessageJobText";
import { useDraftsAndSentScheduleDialogStore } from "#src/store/message/draftsAndSent/scheduleDialog";
import { ScheduledMessageJobType } from "@esposter/db-schema";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { getResultAsync, getSynchronizedFunction, noop, RoutePath } from "@esposter/shared";

interface Props {
  scheduledMessageJob: ScheduledMessageJobWithRoom;
}

const { scheduledMessageJob } = defineProps<Props>();
const emit = defineEmits<{ delete: [] }>();
const cancelScheduledMessageJobToDraft = useCancelScheduledMessageJobToDraft();
const draftsAndSentScheduleDialogStore = useDraftsAndSentScheduleDialogStore();
const { open } = draftsAndSentScheduleDialogStore;
// Leaving for the room is at once, beside the cancel rather than after it
const navigateToRoom = getSynchronizedFunction(async () => {
  await getResultAsync(() => navigateTo(RoutePath.Messages(scheduledMessageJob.roomId))).match(noop, createErrorAlert);
});
// Only a scheduled message reschedules, and it keeps the thread it was scheduled into. A reminder posts no message to
// Move, so it is set again instead
const threadRootId =
  scheduledMessageJob.payload.type === ScheduledMessageJobType.ScheduledMessage
    ? scheduledMessageJob.payload.replyToId || 0
    : 0;
// The job's text takes the room's composer as the cancel is sent, and the page goes there with it. A cancel the
// Server refuses gives the job back and the composer its own text
const editScheduledMessage = () => {
  cancelScheduledMessageJobToDraft(scheduledMessageJob);
  navigateToRoom();
};
const items = computed<Item[]>(() => [
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
    delete-label="Delete message"
    edit-label="Edit scheduled message"
    label="Scheduled message actions"
    @delete="emit('delete')"
    @edit="editScheduledMessage()"
  />
</template>
