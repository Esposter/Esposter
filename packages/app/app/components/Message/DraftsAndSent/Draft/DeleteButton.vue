<script setup lang="ts">
import type { DraftItem } from "@/models/message/draftsAndSent/DraftItem";

import { useInputStore } from "@/store/message/input";

interface Props {
  draftItem: DraftItem;
}

const { draftItem } = defineProps<Props>();
const inputStore = useInputStore();
const { clearComposer } = inputStore;
</script>

<template>
  <StyledDeleteFormDialog
    :card-props="{ title: 'Delete draft' }"
    @delete="
      (onComplete) => {
        clearComposer({ roomId: draftItem.room.id, threadRootRowKey: draftItem.threadRootRowKey });
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
