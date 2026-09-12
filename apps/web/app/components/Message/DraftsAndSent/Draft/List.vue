<script setup lang="ts">
import { DraftsAndSentTab } from "@/models/message/draftsAndSent/DraftsAndSentTab";
import { DraftsAndSentTabMetadataMap } from "@/services/message/draftsAndSent/DraftsAndSentTabMetadataMap";
import { getTimelineSections } from "@/services/message/draftsAndSent/getTimelineSections";

const draftItems = useDraftItems();
const sections = computed(() => getTimelineSections(draftItems.value, ({ updatedAt }) => updatedAt));
</script>

<template>
  <div v-if="draftItems.length" flex flex-col gap-y-6>
    <MessageDraftsAndSentSection v-for="section of sections" :key="section.title" :title="section.title">
      <MessageDraftsAndSentDraftListItem v-for="draftItem of section.items" :key="draftItem.composerKey" :draft-item />
    </MessageDraftsAndSentSection>
  </div>
  <StyledEmptyState v-else h-full :icon="DraftsAndSentTabMetadataMap[DraftsAndSentTab.Drafts].icon" title="No drafts" />
</template>
