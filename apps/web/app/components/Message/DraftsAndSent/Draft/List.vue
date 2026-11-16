<script setup lang="ts">
import type { DraftItem } from "#src/models/message/draftsAndSent/DraftItem";
import type { UiListItem } from "#src/models/ui/UiListItem";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { getDraftItemRoute } from "#src/services/message/draftsAndSent/getDraftItemRoute";
import { useInputStore } from "#src/store/message/input/index";

const draftItems = useDraftItems();
const inputStore = useInputStore();
const { clearComposer } = inputStore;
// The draft the delete confirm is open for, as its composer key
const deletingComposerKey = ref("");
const { isOpen: isDeleteOpen, item: deletingDraftItem } = useSingletonDialog(deletingComposerKey, () =>
  draftItems.value.find(({ composerKey }) => composerKey === deletingComposerKey.value),
);
const getRow = (draftItem: DraftItem): UiListItem<string> => ({
  description: draftItem.content,
  image: draftItem.room.image ?? "",
  title: draftItem.threadRootId ? `${draftItem.room.name} — thread` : draftItem.room.name,
  to: getDraftItemRoute(draftItem),
  value: draftItem.composerKey,
});
const getDate = ({ updatedAt }: DraftItem) => updatedAt;
</script>

<template>
  <MessageDraftsAndSentTimelineList v-if="draftItems.length > 0" :get-date :get-row :items="draftItems" label="Drafts">
    <template #actions="{ item }">
      <MessageDraftsAndSentDraftSendButton :draft-item="item" />
      <MessageDraftsAndSentDraftMoreMenu :draft-item="item" @delete="deletingComposerKey = item.composerKey" />
    </template>
  </MessageDraftsAndSentTimelineList>
  <UiEmptyState
    v-else
    description="A message you start and leave waits here until you send it."
    :meaning="UiIconMeaning.Edit"
    title="No drafts"
  />
  <MessageDraftsAndSentDeleteConfirmDialog
    v-if="deletingDraftItem"
    v-model="isDeleteOpen"
    title="Delete draft"
    :confirm="
      () =>
        deletingDraftItem &&
        clearComposer({ roomId: deletingDraftItem.room.id, threadRootId: deletingDraftItem.threadRootId })
    "
  >
    <p>Are you sure you want to delete this draft?</p>
  </MessageDraftsAndSentDeleteConfirmDialog>
</template>
