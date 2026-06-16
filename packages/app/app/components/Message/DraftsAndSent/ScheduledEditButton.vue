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
  <v-tooltip text="Edit scheduled message">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        :="tooltipProps"
        density="comfortable"
        icon="mdi-pencil-outline"
        size="small"
        variant="text"
        @click.stop="
          async () => {
            await cancelScheduledMessageJobToDraft(scheduledMessageJob);
            await navigateTo(RoutePath.Messages(scheduledMessageJob.roomId));
          }
        "
      />
    </template>
  </v-tooltip>
</template>
