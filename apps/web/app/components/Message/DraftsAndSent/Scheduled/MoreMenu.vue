<script setup lang="ts">
import type { ScheduledMessageJobWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobWithRoom";
import type { Item } from "@/models/shared/Item";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getScheduledMessageJobText } from "@/services/message/draftsAndSent/getScheduledMessageJobText";
import { useDraftsAndSentScheduleDialogStore } from "@/store/message/draftsAndSent/scheduleDialog";
import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";
import { ScheduledMessageJobType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";

interface Props {
  scheduledMessageJob: ScheduledMessageJobWithRoom;
}

const { scheduledMessageJob } = defineProps<Props>();
const scheduledMessageJobStore = useScheduledMessageJobStore();
const { cancelScheduledMessageJob } = scheduledMessageJobStore;
const cancelScheduledMessageJobToDraft = useCancelScheduledMessageJobToDraft();
const draftsAndSentScheduleDialogStore = useDraftsAndSentScheduleDialogStore();
const { open } = draftsAndSentScheduleDialogStore;
// Only a scheduled message reschedules, and it keeps the thread it was scheduled into. A reminder posts no message to
// move, so it is set again instead
const threadRootId =
  scheduledMessageJob.payload.type === ScheduledMessageJobType.ScheduledMessage
    ? scheduledMessageJob.payload.replyToId || ""
    : "";
const items = computed<Item[]>(() => [
  {
    meaning: UiIconMeaning.Edit,
    onClick: async () => {
      // A cancel the server rejected leaves the job scheduled, so the page stays where it is
      if (await cancelScheduledMessageJobToDraft(scheduledMessageJob))
        await navigateTo(RoutePath.Messages(scheduledMessageJob.roomId));
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
    :confirm-delete="() => cancelScheduledMessageJob(scheduledMessageJob)"
    delete-label="Delete message"
    delete-message="Are you sure you want to delete this scheduled message?"
    label="Scheduled message actions"
  />
</template>
