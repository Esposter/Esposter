<script setup lang="ts">
import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";

import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";
import { ScheduledMessageJobType } from "@esposter/db-schema";

interface MessageDraftsAndSentScheduledSendButtonProps {
  scheduledMessageJob: ScheduledMessageJobInMessageWithRoom;
}

const { scheduledMessageJob } = defineProps<MessageDraftsAndSentScheduledSendButtonProps>();
const scheduledMessageJobStore = useScheduledMessageJobStore();
const { sendScheduledMessageNow } = scheduledMessageJobStore;
</script>

<template>
  <MessageDraftsAndSentActionButton
    :button-props="{ disabled: scheduledMessageJob.payload.type !== ScheduledMessageJobType.ScheduledMessage }"
    icon="mdi-send-outline"
    text="Send message"
    @click="sendScheduledMessageNow(scheduledMessageJob.id)"
  />
</template>
