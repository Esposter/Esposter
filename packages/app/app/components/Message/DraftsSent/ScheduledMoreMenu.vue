<script setup lang="ts">
import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";

import { withFinalizerAsync } from "@esposter/shared";
import { mergeProps } from "vue";

interface MessageDraftsSentScheduledMoreMenuProps {
  scheduledMessageJob: ScheduledMessageJobInMessageWithRoom;
}

const { scheduledMessageJob } = defineProps<MessageDraftsSentScheduledMoreMenuProps>();
const cancelScheduledMessageJob = useCancelScheduledMessageJob();
const cancelScheduledMessageJobToDraft = useCancelScheduledMessageJobToDraft();
</script>

<template>
  <v-menu location="bottom end">
    <template #activator="{ props: menuProps }">
      <v-tooltip text="More">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            :="mergeProps(menuProps, tooltipProps)"
            density="comfortable"
            icon="mdi-dots-vertical"
            size="small"
            variant="text"
            @click.stop
          />
        </template>
      </v-tooltip>
    </template>
    <v-list density="compact">
      <v-list-item
        title="Cancel schedule and save to drafts"
        @click="cancelScheduledMessageJobToDraft(scheduledMessageJob)"
      />
      <StyledDeleteFormDialog
        :card-props="{
          title: 'Delete message',
          text: 'Are you sure you want to delete this scheduled message?',
        }"
        @delete="
          (onComplete) => withFinalizerAsync(() => cancelScheduledMessageJob(scheduledMessageJob.id), onComplete)
        "
      >
        <template #activator="{ updateIsOpen }">
          <v-list-item title="Delete message" text-error @click.stop="updateIsOpen(true)" />
        </template>
      </StyledDeleteFormDialog>
    </v-list>
  </v-menu>
</template>
