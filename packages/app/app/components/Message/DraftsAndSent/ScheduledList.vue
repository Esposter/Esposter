<script setup lang="ts">
import { getTimelineSections } from "@/services/message/draftsAndSent/getTimelineSections";
import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";

const { readMoreScheduledMessageJobs } = useReadScheduledMessageJobs();
const scheduledMessageJobStore = useScheduledMessageJobStore();
const { hasMore, isPending, items } = storeToRefs(scheduledMessageJobStore);
const sections = computed(() => getTimelineSections(items.value, ({ runAt }) => runAt));
</script>

<template>
  <div v-if="items.length" flex flex-col gap-y-6>
    <MessageDraftsAndSentSection v-for="section of sections" :key="section.title" :title="section.title">
      <MessageDraftsAndSentScheduledListItem
        v-for="scheduledMessageJob of section.items"
        :key="scheduledMessageJob.id"
        :scheduled-message-job
      />
    </MessageDraftsAndSentSection>
    <StyledWaypoint :is-active="hasMore" @change="readMoreScheduledMessageJobs" />
  </div>
  <MessageDraftsAndSentEmptyState v-else-if="!isPending" icon="mdi-clock-outline" title="No scheduled messages" />
</template>
