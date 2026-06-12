<script setup lang="ts">
import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";

import { getDisplayTime } from "@/services/message/draftsSent/getDisplayTime";
import { getScheduledMessageJobIcon } from "@/services/message/draftsSent/getScheduledMessageJobIcon";
import { getScheduledMessageJobText } from "@/services/message/draftsSent/getScheduledMessageJobText";

interface MessageDraftsSentScheduledListItemProps {
  scheduledMessageJob: ScheduledMessageJobInMessageWithRoom;
}

const { scheduledMessageJob } = defineProps<MessageDraftsSentScheduledListItemProps>();
</script>

<template>
  <v-hover #default="{ isHovering, props }">
    <v-list-item :="props">
      <template #prepend>
        <v-avatar bg-background>
          <v-icon :icon="getScheduledMessageJobIcon(scheduledMessageJob)" />
        </v-avatar>
      </template>
      <v-list-item-title font-bold>{{ scheduledMessageJob.room.name }}</v-list-item-title>
      <v-list-item-subtitle>
        <span v-html="getScheduledMessageJobText(scheduledMessageJob)" />
      </v-list-item-subtitle>
      <template #append>
        <div flex gap-x-3 items-center>
          <span op-medium-emphasis text-body-small>{{ getDisplayTime(scheduledMessageJob.runAt) }}</span>
          <div v-show="isHovering" p-1 b-1 b-border rd-lg b-solid bg-surface flex items-center>
            <MessageDraftsSentScheduledEditButton :scheduled-message-job />
            <MessageDraftsSentScheduledRescheduleButton :scheduled-message-job />
            <MessageDraftsSentScheduledSendButton :scheduled-message-job />
            <MessageDraftsSentScheduledMoreMenu :scheduled-message-job />
          </div>
        </div>
      </template>
    </v-list-item>
  </v-hover>
</template>
