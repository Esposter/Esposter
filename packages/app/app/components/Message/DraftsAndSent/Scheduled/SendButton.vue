<script setup lang="ts">
import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";

import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";
import { ScheduledMessageJobType } from "@esposter/db-schema";

interface Props {
  scheduledMessageJob: ScheduledMessageJobInMessageWithRoom;
}

const { scheduledMessageJob } = defineProps<Props>();
const scheduledMessageJobStore = useScheduledMessageJobStore();
const { sendScheduledMessageNow } = scheduledMessageJobStore;
const buttonProps = computed(() => ({
  disabled: scheduledMessageJob.payload.type !== ScheduledMessageJobType.ScheduledMessage,
}));
</script>

<template>
  <MessageDraftsAndSentActionButton
    :button-props
    icon="mdi-send-outline"
    text="Send message"
    @click="sendScheduledMessageNow(scheduledMessageJob.id)"
  />
</template>
