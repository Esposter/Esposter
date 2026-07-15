<script setup lang="ts">
import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";

import { withFinalizerAsync } from "@esposter/shared";

interface MessageDraftsAndSentScheduledMoreMenuProps {
  scheduledMessageJob: ScheduledMessageJobInMessageWithRoom;
}

const { scheduledMessageJob } = defineProps<MessageDraftsAndSentScheduledMoreMenuProps>();
const cancelScheduledMessageJob = useCancelScheduledMessageJob();
const cancelScheduledMessageJobToDraft = useCancelScheduledMessageJobToDraft();
</script>

<template>
  <StyledTooltipMenuIconButton
    :button-props="{ density: 'comfortable', size: 'small', variant: 'text' }"
    icon="mdi-dots-vertical"
    :menu-props="{ location: 'bottom end' }"
    text="More"
    @click.stop
  >
    <v-list density="compact">
      <v-list-item
        title="Cancel schedule and save to drafts"
        @click="cancelScheduledMessageJobToDraft(scheduledMessageJob)"
      />
      <StyledDeleteFormDialog
        :card-props="{ title: 'Delete message' }"
        @delete="
          (onComplete) => withFinalizerAsync(() => cancelScheduledMessageJob(scheduledMessageJob.id), onComplete)
        "
      >
        <template #activator="{ updateIsOpen }">
          <v-list-item title="Delete message" text-error @click.stop="updateIsOpen(true)" />
        </template>
        Are you sure you want to delete this scheduled message?
      </StyledDeleteFormDialog>
    </v-list>
  </StyledTooltipMenuIconButton>
</template>
