<script setup lang="ts">
import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";

import { RoutePath } from "@esposter/shared";

interface MessageDraftsAndSentScheduledEditButtonProps {
  scheduledMessageJob: ScheduledMessageJobInMessageWithRoom;
}

const { scheduledMessageJob } = defineProps<MessageDraftsAndSentScheduledEditButtonProps>();
const cancelScheduledMessageJobToDraft = useCancelScheduledMessageJobToDraft();
</script>

<template>
  <MessageDraftsAndSentActionButton
    icon="mdi-pencil-outline"
    text="Edit scheduled message"
    @click="
      async () => {
        await cancelScheduledMessageJobToDraft(scheduledMessageJob);
        await navigateTo(RoutePath.Messages(scheduledMessageJob.roomId));
      }
    "
  />
</template>
