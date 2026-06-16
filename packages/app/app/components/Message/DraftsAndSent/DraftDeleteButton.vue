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
    :card-props="{ title: 'Delete draft', text: 'Are you sure you want to delete this draft?' }"
    @delete="
      (onComplete) => {
        clearDraft(draftItem.room.id);
        onComplete();
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-tooltip text="Delete draft">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            :="tooltipProps"
            density="comfortable"
            icon="mdi-delete-outline"
            size="small"
            variant="text"
            @click.stop="updateIsOpen(true)"
          />
        </template>
      </v-tooltip>
    </template>
  </StyledDeleteFormDialog>
</template>
