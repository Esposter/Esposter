<script setup lang="ts">
import { getTimelineSections } from "@/services/message/draftsSent/getTimelineSections";
import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";

const { readMoreScheduledMessageJobs } = useReadScheduledMessageJobs();

const scheduledMessageJobStore = useScheduledMessageJobStore();
const { hasMore, isPending, items } = storeToRefs(scheduledMessageJobStore);
const sections = computed(() => getTimelineSections(items.value, ({ runAt }) => runAt));
</script>

<template>
  <div v-if="items.length" flex flex-col gap-y-6>
    <MessageDraftsSentSection v-for="section of sections" :key="section.title" :title="section.title">
      <MessageDraftsSentScheduledListItem
        v-for="scheduledMessageJob of section.items"
        :key="scheduledMessageJob.id"
        :scheduled-message-job="scheduledMessageJob"
      />
    </MessageDraftsSentSection>
    <StyledWaypoint :is-active="hasMore" @change="readMoreScheduledMessageJobs" />
  </div>
  <MessageDraftsSentEmptyState v-else-if="!isPending" icon="mdi-clock-outline" title="No scheduled messages" />
</template>
