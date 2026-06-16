<script setup lang="ts">
import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";

import { getDisplayTime } from "@/services/message/draftsAndSent/getDisplayTime";
import { getScheduledMessageJobIcon } from "@/services/message/draftsAndSent/getScheduledMessageJobIcon";
import { getScheduledMessageJobText } from "@/services/message/draftsAndSent/getScheduledMessageJobText";

interface MessageDraftsAndSentScheduledListItemProps {
  scheduledMessageJob: ScheduledMessageJobInMessageWithRoom;
}

const { scheduledMessageJob } = defineProps<MessageDraftsAndSentScheduledListItemProps>();
const isFocusWithin = ref(false);
const onFocusOut = (event: FocusEvent) => {
  const currentTarget = event.currentTarget;
  const relatedTarget = event.relatedTarget;
  isFocusWithin.value =
    currentTarget instanceof window.HTMLElement &&
    relatedTarget instanceof window.Node &&
    currentTarget.contains(relatedTarget);
};
</script>

<template>
  <v-hover #default="{ isHovering, props }">
    <v-list-item :="props" tabindex="0" @focusin="isFocusWithin = true" @focusout="onFocusOut($event)">
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
          <div v-show="isHovering || isFocusWithin" p-1 b-1 b-border rd-lg b-solid bg-surface flex items-center>
            <MessageDraftsAndSentScheduledEditButton :scheduled-message-job />
            <MessageDraftsAndSentScheduledRescheduleButton :scheduled-message-job />
            <MessageDraftsAndSentScheduledSendButton :scheduled-message-job />
            <MessageDraftsAndSentScheduledMoreMenu :scheduled-message-job />
          </div>
        </div>
      </template>
    </v-list-item>
  </v-hover>
</template>
