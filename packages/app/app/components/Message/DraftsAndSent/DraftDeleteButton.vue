<script setup lang="ts">
import type { DraftItem } from "@/models/message/draftsAndSent/DraftItem";

import { useInputStore } from "@/store/message/input";

interface MessageDraftsAndSentDraftDeleteButtonProps {
  draftItem: DraftItem;
}

const { draftItem } = defineProps<MessageDraftsAndSentDraftDeleteButtonProps>();
const inputStore = useInputStore();
const { clearDraft } = inputStore;
</script>

<template>
  <StyledDeleteFormDialog
    :card-props="{ title: 'Delete draft' }"
    @delete="
      (onComplete) => {
        clearDraft(draftItem.room.id);
        onComplete();
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <MessageDraftsAndSentActionButton icon="mdi-delete-outline" text="Delete draft" @click="updateIsOpen(true)" />
    </template>
    Are you sure you want to delete this draft?
  </StyledDeleteFormDialog>
</template>
