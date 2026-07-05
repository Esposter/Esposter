<script setup lang="ts">
import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";

import { getDisplayTime } from "@/services/message/draftsAndSent/getDisplayTime";
import { getScheduledMessageJobIcon } from "@/services/message/draftsAndSent/getScheduledMessageJobIcon";
import { getScheduledMessageJobText } from "@/services/message/draftsAndSent/getScheduledMessageJobText";

interface MessageDraftsAndSentScheduledListItemProps {
  scheduledMessageJob: ScheduledMessageJobInMessageWithRoom;
}

const { scheduledMessageJob } = defineProps<MessageDraftsAndSentScheduledListItemProps>();
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
        <v-icon :icon="getScheduledMessageJobIcon(scheduledMessageJob)" />
      </v-avatar>
    </template>
    <MessageDraftsAndSentScheduledEditButton :scheduled-message-job />
    <MessageDraftsAndSentScheduledRescheduleButton :scheduled-message-job />
    <MessageDraftsAndSentScheduledSendButton :scheduled-message-job />
    <MessageDraftsAndSentScheduledMoreMenu :scheduled-message-job />
  </MessageDraftsAndSentBaseListItem>
</template>
