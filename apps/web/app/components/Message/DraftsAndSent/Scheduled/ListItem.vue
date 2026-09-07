<script setup lang="ts">
import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";

import { getDisplayTime } from "@/services/message/draftsAndSent/getDisplayTime";
import { getScheduledMessageJobText } from "@/services/message/draftsAndSent/getScheduledMessageJobText";
import { ScheduledMessageJobIconMap } from "@/services/message/draftsAndSent/ScheduledMessageJobIconMap";

interface Props {
  scheduledMessageJob: ScheduledMessageJobInMessageWithRoom;
}

const { scheduledMessageJob } = defineProps<Props>();
</script>

<template>
  <MessageDraftsAndSentBaseListItem
    :display-time="getDisplayTime(scheduledMessageJob.runAt)"
    :subtitle="getScheduledMessageJobText(scheduledMessageJob)"
    :title="scheduledMessageJob.room.name"
    tabindex="0"
  >
    <template #prepend>
      <v-avatar bg-background>
        <v-icon :icon="ScheduledMessageJobIconMap[scheduledMessageJob.payload.type]" />
      </v-avatar>
    </template>
    <MessageDraftsAndSentScheduledEditButton :scheduled-message-job />
    <MessageDraftsAndSentScheduledRescheduleButton :scheduled-message-job />
    <MessageDraftsAndSentScheduledSendButton :scheduled-message-job />
    <MessageDraftsAndSentScheduledMoreMenu :scheduled-message-job />
  </MessageDraftsAndSentBaseListItem>
</template>
