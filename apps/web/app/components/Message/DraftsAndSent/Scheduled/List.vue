<script setup lang="ts">
import { DraftsAndSentTab } from "@/models/message/draftsAndSent/DraftsAndSentTab";
import { DraftsAndSentTabMetadataMap } from "@/services/message/draftsAndSent/DraftsAndSentTabMetadataMap";
import { getTimelineSections } from "@/services/message/draftsAndSent/getTimelineSections";
import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";

const { readMoreScheduledMessageJobs } = useReadScheduledMessageJobs();
const scheduledMessageJobStore = useScheduledMessageJobStore();
const { hasMore, isLoaded, items } = storeToRefs(scheduledMessageJobStore);
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
  <StyledEmptyState
    v-else-if="isLoaded"
    h-full
    :icon="DraftsAndSentTabMetadataMap[DraftsAndSentTab.Scheduled].icon"
    title="No scheduled messages"
  />
</template>
