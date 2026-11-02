<script setup lang="ts">
import type { UiTabItem } from "@/models/ui/UiTabItem";

import { DraftsAndSentTab, DraftsAndSentTabs } from "@/models/message/draftsAndSent/DraftsAndSentTab";
import { DraftsAndSentTabMetadataMap } from "@/services/message/draftsAndSent/DraftsAndSentTabMetadataMap";
import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";
import { useSentMessageStore } from "@/store/message/sentMessage";

defineSlots<{ default: (props: { value: DraftsAndSentTab }) => VNode }>();
const tab = defineModel<DraftsAndSentTab>({ required: true });
const draftItems = useDraftItems();
const scheduledMessageJobStore = useScheduledMessageJobStore();
const { scheduledMessageJobCount } = storeToRefs(scheduledMessageJobStore);
const sentMessageStore = useSentMessageStore();
const { sentMessageCount } = storeToRefs(sentMessageStore);
const items = computed<UiTabItem<DraftsAndSentTab>[]>(() => {
  const counts = {
    [DraftsAndSentTab.Drafts]: draftItems.value.length,
    [DraftsAndSentTab.Scheduled]: scheduledMessageJobCount.value,
    [DraftsAndSentTab.Sent]: sentMessageCount.value,
  };
  return Array.from(DraftsAndSentTabs, (value) => {
    const { icon, title } = DraftsAndSentTabMetadataMap[value];
    return { count: counts[value] || undefined, icon, title, value };
  });
});
</script>

<template>
  <UiTabs v-model="tab" :items label="Drafts & sent">
    <template #default="{ value }">
      <slot :value />
    </template>
  </UiTabs>
</template>
