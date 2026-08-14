<script setup lang="ts">
import type { DraftItem } from "@/models/message/draftsAndSent/DraftItem";

import { RoutePath } from "@esposter/shared";

interface MessageDraftsAndSentDraftEditButtonProps {
  draftItem: DraftItem;
}

const { draftItem } = defineProps<MessageDraftsAndSentDraftEditButtonProps>();
</script>

<template>
  <MessageDraftsAndSentActionButton
    icon="mdi-pencil-outline"
    text="Edit draft"
    @click="
      navigateTo(
        draftItem.threadRootRowKey
          ? RoutePath.MessagesThread(draftItem.room.id, draftItem.threadRootRowKey)
          : RoutePath.Messages(draftItem.room.id),
      )
    "
  />
</template>
