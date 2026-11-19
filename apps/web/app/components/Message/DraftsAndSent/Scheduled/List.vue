<script setup lang="ts">
import type { ScheduledMessageJobWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobWithRoom";
import type { UiListItem } from "#src/models/ui/UiListItem";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { getScheduledMessageJobText } from "#src/services/message/draftsAndSent/getScheduledMessageJobText";
import { ScheduledMessageJobIconMap } from "#src/services/message/draftsAndSent/ScheduledMessageJobIconMap";
import { useScheduledMessageJobStore } from "#src/store/message/scheduledMessageJob";
import { RoutePath } from "@esposter/shared";

const { readMoreScheduledMessageJobs } = useReadScheduledMessageJobs();
const scheduledMessageJobStore = useScheduledMessageJobStore();
const { cancelScheduledMessageJob } = scheduledMessageJobStore;
const { hasMore, isLoaded, items } = storeToRefs(scheduledMessageJobStore);
// The job the delete confirm is open for, as its id
const deletingScheduledMessageJobId = ref("");
const { isOpen: isDeleteOpen, item: deletingScheduledMessageJob } = useSingletonDialog(
  deletingScheduledMessageJobId,
  () => items.value.find(({ id }) => id === deletingScheduledMessageJobId.value),
);
// A job leads with what it will do, post a message or remind, and opens the room it runs in
const getRow = (scheduledMessageJob: ScheduledMessageJobWithRoom): UiListItem<string> => ({
  description: getScheduledMessageJobText(scheduledMessageJob),
  icon: ScheduledMessageJobIconMap[scheduledMessageJob.payload.type],
  title: scheduledMessageJob.room.name,
  to: RoutePath.Messages(scheduledMessageJob.roomId),
  value: scheduledMessageJob.id,
});
const getDate = ({ runAt }: ScheduledMessageJobWithRoom) => runAt;
</script>

<template>
  <div v-if="items.length > 0" flex flex-col>
    <MessageDraftsAndSentTimelineList :get-date :get-row :items label="Scheduled messages">
      <template #actions="{ item }">
        <MessageDraftsAndSentScheduledSendButton :scheduled-message-job="item" />
        <MessageDraftsAndSentScheduledMoreMenu
          :scheduled-message-job="item"
          @delete="deletingScheduledMessageJobId = item.id"
        />
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
  <MessageDraftsAndSentDeleteConfirmDialog
    v-if="deletingScheduledMessageJob"
    v-model="isDeleteOpen"
    title="Delete message"
    :confirm="() => deletingScheduledMessageJob && cancelScheduledMessageJob(deletingScheduledMessageJob)"
  >
    <p>Are you sure you want to delete this scheduled message?</p>
  </MessageDraftsAndSentDeleteConfirmDialog>
</template>
