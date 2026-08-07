<script setup lang="ts">
import { getTimelineSections } from "@/services/message/draftsAndSent/getTimelineSections";

const draftItems = useDraftItems();
const sections = computed(() => getTimelineSections(draftItems.value, ({ updatedAt }) => updatedAt));
</script>

<template>
  <div v-if="draftItems.length" flex flex-col gap-y-6>
    <MessageDraftsAndSentSection v-for="section of sections" :key="section.title" :title="section.title">
      <MessageDraftsAndSentDraftListItem v-for="draftItem of section.items" :key="draftItem.room.id" :draft-item />
    </MessageDraftsAndSentSection>
  </div>
  <MessageDraftsAndSentEmptyState v-else icon="mdi-pencil" title="No drafts" />
</template>
