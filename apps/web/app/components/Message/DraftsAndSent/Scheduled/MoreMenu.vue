<script setup lang="ts">
import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";

import { DRAFTS_AND_SENT_ACTION_BUTTON_PROPS } from "@/services/message/draftsAndSent/constants";
import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";
import { withFinalizerAsync } from "@esposter/shared";

interface Props {
  scheduledMessageJob: ScheduledMessageJobInMessageWithRoom;
}

const { scheduledMessageJob } = defineProps<Props>();
const scheduledMessageJobStore = useScheduledMessageJobStore();
const { cancelScheduledMessageJob } = scheduledMessageJobStore;
const cancelScheduledMessageJobToDraft = useCancelScheduledMessageJobToDraft();
</script>

<template>
  <StyledTooltipMenuIconButton
    :button-props="DRAFTS_AND_SENT_ACTION_BUTTON_PROPS"
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
