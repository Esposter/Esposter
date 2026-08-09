<script setup lang="ts">
import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";

import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";
import { ScheduledMessageJobType } from "@esposter/db-schema";

interface MessageDraftsAndSentScheduledSendButtonProps {
  scheduledMessageJob: ScheduledMessageJobInMessageWithRoom;
}

const { scheduledMessageJob } = defineProps<MessageDraftsAndSentScheduledSendButtonProps>();
const { $trpc } = useNuxtApp();
const scheduledMessageJobStore = useScheduledMessageJobStore();
const { removeScheduledMessageJob } = scheduledMessageJobStore;
const { count, items } = storeToRefs(scheduledMessageJobStore);
const { executeMutation } = useMutation();
const sendScheduledMessageNow = async () => {
  if (scheduledMessageJob.payload.type !== ScheduledMessageJobType.ScheduledMessage) return;
  await executeMutation(
    () => $trpc.message.scheduledMessageJob.sendScheduledMessageNow.mutate({ id: scheduledMessageJob.id }),
    {
      // The one row this write sends, not a copy of the page: reinstating the page would resurrect a job another
      // Cancel already took off it and drop whatever the page gained while this write was in flight
      applyOptimistic: () => {
        const sentScheduledMessageJob = items.value.find(({ id }) => id === scheduledMessageJob.id);
        removeScheduledMessageJob(scheduledMessageJob.id);
        return () => {
          if (!sentScheduledMessageJob) return;

          // Back at the end of the page rather than where it stood — a cosmetic loss, taken over dropping a row
          items.value = [...items.value, sentScheduledMessageJob];
          count.value += 1;
        };
      },
      key: scheduledMessageJob.id,
    },
  );
};
</script>

<template>
  <MessageDraftsAndSentActionButton
    :button-props="{ disabled: scheduledMessageJob.payload.type !== ScheduledMessageJobType.ScheduledMessage }"
    icon="mdi-send-outline"
    text="Send message"
    @click="sendScheduledMessageNow"
  />
</template>
