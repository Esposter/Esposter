<script setup lang="ts">
import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";

import { ScheduledMessageJobType } from "@esposter/db-schema";

interface MessageDraftsAndSentScheduledSendButtonProps {
  scheduledMessageJob: ScheduledMessageJobInMessageWithRoom;
}

const { scheduledMessageJob } = defineProps<MessageDraftsAndSentScheduledSendButtonProps>();
const { $trpc } = useNuxtApp();
const { readScheduledMessageJobs } = useReadScheduledMessageJobs();
</script>

<template>
  <MessageDraftsAndSentActionButton
    :button-props="{ disabled: scheduledMessageJob.payload.type !== ScheduledMessageJobType.ScheduledMessage }"
    icon="mdi-send-outline"
    text="Send message"
    @click="
      async () => {
        if (scheduledMessageJob.payload.type !== ScheduledMessageJobType.ScheduledMessage) return;
        await $trpc.message.scheduledMessageJob.sendScheduledMessageNow.mutate({ id: scheduledMessageJob.id });
        await readScheduledMessageJobs();
      }
    "
  />
</template>
