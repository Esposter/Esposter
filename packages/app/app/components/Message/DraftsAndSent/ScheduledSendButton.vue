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
const executeMutation = useMutation();
const sendScheduledMessageNow = async () => {
  if (scheduledMessageJob.payload.type !== ScheduledMessageJobType.ScheduledMessage) return;
  await executeMutation(
    () => $trpc.message.scheduledMessageJob.sendScheduledMessageNow.mutate({ id: scheduledMessageJob.id }),
    {
      applyOptimistic: () => {
        const itemsSnapshot = items.value;
        const countSnapshot = count.value;
        removeScheduledMessageJob(scheduledMessageJob.id);
        return () => {
          items.value = itemsSnapshot;
          count.value = countSnapshot;
        };
      },
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
