<script setup lang="ts">
import { DraftsAndSentTab } from "@/models/message/draftsAndSent/DraftsAndSentTab";
import { DraftsAndSentTabMetadataMap } from "@/services/message/draftsAndSent/DraftsAndSentTabMetadataMap";
import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";
import { useSentMessageStore } from "@/store/message/sentMessage";

const tab = defineModel<DraftsAndSentTab>({ required: true });
const draftItems = useDraftItems();
const scheduledMessageJobStore = useScheduledMessageJobStore();
const { scheduledMessageJobCount } = storeToRefs(scheduledMessageJobStore);
const sentMessageStore = useSentMessageStore();
const { sentMessageCount } = storeToRefs(sentMessageStore);
const tabs = computed(() => [
  {
    ...DraftsAndSentTabMetadataMap[DraftsAndSentTab.Drafts],
    count: draftItems.value.length,
    value: DraftsAndSentTab.Drafts,
  },
  {
    ...DraftsAndSentTabMetadataMap[DraftsAndSentTab.Scheduled],
    count: scheduledMessageJobCount.value,
    value: DraftsAndSentTab.Scheduled,
  },
  {
    ...DraftsAndSentTabMetadataMap[DraftsAndSentTab.Sent],
    count: sentMessageCount.value,
    value: DraftsAndSentTab.Sent,
  },
]);
</script>

<template>
  <v-tabs v-model="tab">
    <v-tab v-for="{ count, icon, title, value } of tabs" :key="value" :value>
      <span>{{ title }}</span>
      <template v-if="count">
        <v-icon :icon ml-1 size="x-small" />
        <span>{{ count }}</span>
      </template>
    </v-tab>
  </v-tabs>
</template>
