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
  <v-tooltip text="Send message">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        :="tooltipProps"
        :disabled="scheduledMessageJob.payload.type !== ScheduledMessageJobType.ScheduledMessage"
        density="comfortable"
        icon="mdi-send-outline"
        size="small"
        variant="text"
        @click.stop="
          async () => {
            if (scheduledMessageJob.payload.type !== ScheduledMessageJobType.ScheduledMessage) return;
            await $trpc.message.scheduledMessageJob.sendScheduledMessageNow.mutate({ id: scheduledMessageJob.id });
            await readScheduledMessageJobs();
          }
        "
      />
    </template>
  </v-tooltip>
</template>
