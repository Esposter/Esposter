<script setup lang="ts">
import type { UiTabItem } from "@/models/ui/UiTabItem";

import { DraftsAndSentTab, DraftsAndSentTabs } from "@/models/message/draftsAndSent/DraftsAndSentTab";
import { DraftsAndSentTabMetadataMap } from "@/services/message/draftsAndSent/DraftsAndSentTabMetadataMap";
import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";

defineSlots<{ default: (props: { value: DraftsAndSentTab }) => VNode }>();
const tab = defineModel<DraftsAndSentTab>({ required: true });
const draftItems = useDraftItems();
const scheduledMessageJobStore = useScheduledMessageJobStore();
const { scheduledMessageJobCount } = storeToRefs(scheduledMessageJobStore);
const items = computed<UiTabItem<DraftsAndSentTab>[]>(() => {
  // The server no longer counts sent messages, so the Sent tab shows no count
  const counts: Partial<Record<DraftsAndSentTab, number>> = {
    [DraftsAndSentTab.Drafts]: draftItems.value.length,
    [DraftsAndSentTab.Scheduled]: scheduledMessageJobCount.value,
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
