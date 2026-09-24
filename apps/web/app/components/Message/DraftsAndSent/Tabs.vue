<script setup lang="ts">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { DraftsAndSentTab } from "@/models/message/draftsAndSent/DraftsAndSentTab";
import { DraftsAndSentTabMetadataMap } from "@/services/message/draftsAndSent/DraftsAndSentTabMetadataMap";
import { useScheduledMessageJobStore } from "@/store/message/scheduledMessageJob";
import { useSentMessageStore } from "@/store/message/sentMessage";

const tab = defineModel<DraftsAndSentTab>({ required: true });
defineSlots<{ default: (props: { value: DraftsAndSentTab }) => VNode }>();
const draftItems = useDraftItems();
const scheduledMessageJobStore = useScheduledMessageJobStore();
const { scheduledMessageJobCount } = storeToRefs(scheduledMessageJobStore);
const sentMessageStore = useSentMessageStore();
const { sentMessageCount } = storeToRefs(sentMessageStore);
const counts = computed(() => ({
  [DraftsAndSentTab.Drafts]: draftItems.value.length,
  [DraftsAndSentTab.Scheduled]: scheduledMessageJobCount.value,
  [DraftsAndSentTab.Sent]: sentMessageCount.value,
}));
// @TODO: a tab's count is its own reading once UiTabs draws one beside the title (ui-library gap)
const items = computed<UiMenuItem<DraftsAndSentTab>[]>(() =>
  Object.values(DraftsAndSentTab).map((value) => {
    const { icon, title } = DraftsAndSentTabMetadataMap[value];
    const count = counts.value[value];
    return { icon, title: count ? `${title} · ${count}` : title, value };
  }),
);
</script>

<template>
  <UiTabs v-model="tab" :items label="Drafts & sent">
    <template #default="{ value }">
      <slot :value />
    </template>
  </UiTabs>
</template>
