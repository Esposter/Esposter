<script setup lang="ts">
import { DraftsSentTab } from "@/models/message/draftsSent/DraftsSentTab";
import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";
import { useSentMessageStore } from "@/store/message/sentMessage";

const tab = defineModel<DraftsSentTab>({ required: true });
const draftItems = useDraftItems();
const scheduledMessageJobStore = useScheduledMessageJobStore();
const { count: scheduledMessageJobCount } = storeToRefs(scheduledMessageJobStore);
const sentMessageStore = useSentMessageStore();
const { count: sentMessageCount } = storeToRefs(sentMessageStore);
const tabs = computed(() => [
  { count: draftItems.value.length, icon: "mdi-pencil", title: "Drafts", value: DraftsSentTab.Drafts },
  {
    count: scheduledMessageJobCount.value,
    icon: "mdi-clock-outline",
    title: "Scheduled",
    value: DraftsSentTab.Scheduled,
  },
  { count: sentMessageCount.value, icon: "mdi-send-outline", title: "Sent", value: DraftsSentTab.Sent },
]);
</script>

<template>
  <v-tabs v-model="tab" mt-4>
    <v-tab v-for="{ count, icon, title, value } of tabs" :key="value" :value>
      <span>{{ title }}</span>
      <template v-if="count">
        <v-icon :icon ml-1 size="x-small" />
        <span>{{ count }}</span>
      </template>
    </v-tab>
  </v-tabs>
</template>
