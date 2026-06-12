<script setup lang="ts">
import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";

import { useDataStore } from "@/store/message/data";
import { MessageType, ScheduledMessageJobType } from "@esposter/db-schema";

interface MessageDraftsSentScheduledSendButtonProps {
  scheduledMessageJob: ScheduledMessageJobInMessageWithRoom;
}

const { scheduledMessageJob } = defineProps<MessageDraftsSentScheduledSendButtonProps>();
const dataStore = useDataStore();
const { createMessage } = dataStore;
const cancelScheduledMessageJob = useCancelScheduledMessageJob();
const sendScheduledMessageJob = async () => {
  const { payload, roomId } = scheduledMessageJob;
  if (payload.type !== ScheduledMessageJobType.ScheduledMessage) return;
  await createMessage({ files: [], message: payload.message, roomId, type: MessageType.Message });
  await cancelScheduledMessageJob(scheduledMessageJob.id);
};
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
        @click.stop="sendScheduledMessageJob"
      />
    </template>
  </v-tooltip>
</template>
