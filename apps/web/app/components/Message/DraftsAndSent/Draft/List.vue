<script setup lang="ts">
import type { DraftItem } from "@/models/message/draftsAndSent/DraftItem";
import type { UiListItem } from "@/models/ui/UiListItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getDraftItemRoute } from "@/services/message/draftsAndSent/getDraftItemRoute";

const draftItems = useDraftItems();
const getRow = (draftItem: DraftItem): UiListItem<string> => ({
  description: draftItem.content,
  image: draftItem.room.image ?? "",
  title: draftItem.threadRootRowKey ? `${draftItem.room.name} — thread` : draftItem.room.name,
  to: getDraftItemRoute(draftItem),
  value: draftItem.composerKey,
});
</script>

<template>
  <MessageDraftsAndSentTimelineList
    v-if="draftItems.length > 0"
    :get-date="({ updatedAt }) => updatedAt"
    :get-row
    :items="draftItems"
    label="Drafts"
  >
    <template #actions="{ item }">
      <MessageDraftsAndSentDraftSendButton :draft-item="item" />
      <MessageDraftsAndSentDraftMoreMenu :draft-item="item" />
    </template>
  </MessageDraftsAndSentTimelineList>
  <UiEmptyState
    v-else
    description="A message you start and leave waits here until you send it."
    :meaning="UiIconMeaning.Edit"
    title="No drafts"
  />
</template>
