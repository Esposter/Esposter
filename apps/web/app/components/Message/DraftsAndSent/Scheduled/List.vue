<script setup lang="ts">
import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";
import type { UiListItem } from "@/models/ui/UiListItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getScheduledMessageJobText } from "@/services/message/draftsAndSent/getScheduledMessageJobText";
import { ScheduledMessageJobIconMap } from "@/services/message/draftsAndSent/ScheduledMessageJobIconMap";
import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";
import { RoutePath } from "@esposter/shared";

const { readMoreScheduledMessageJobs } = useReadScheduledMessageJobs();
const scheduledMessageJobStore = useScheduledMessageJobStore();
const { hasMore, isLoaded, items } = storeToRefs(scheduledMessageJobStore);
// A job leads with what it will do, post a message or remind, and opens the room it runs in
const getRow = (scheduledMessageJob: ScheduledMessageJobInMessageWithRoom): UiListItem<string> => ({
  description: getScheduledMessageJobText(scheduledMessageJob),
  icon: ScheduledMessageJobIconMap[scheduledMessageJob.payload.type],
  title: scheduledMessageJob.room.name,
  to: RoutePath.Messages(scheduledMessageJob.roomId),
  value: scheduledMessageJob.id,
});
</script>

<template>
  <div v-if="items.length > 0" flex flex-col>
    <MessageDraftsAndSentTimelineList :get-date="({ runAt }) => runAt" :get-row :items label="Scheduled messages">
      <template #actions="{ item }">
        <MessageDraftsAndSentScheduledSendButton :scheduled-message-job="item" />
        <MessageDraftsAndSentScheduledMoreMenu :scheduled-message-job="item" />
      </template>
    </MessageDraftsAndSentTimelineList>
    <StyledWaypoint :is-active="hasMore" @change="(onComplete) => readMoreScheduledMessageJobs(onComplete)" />
  </div>
  <UiEmptyState
    v-else-if="isLoaded"
    description="Schedule a draft and it waits here until it runs."
    :meaning="UiIconMeaning.Awaiting"
    title="No scheduled messages"
  />
  <MessageDraftsAndSentListSkeleton v-else />
</template>
