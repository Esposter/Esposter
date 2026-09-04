<script setup lang="ts">
import type { DraftItem } from "@/models/message/draftsAndSent/DraftItem";

import { getDisplayTime } from "@/services/message/draftsAndSent/getDisplayTime";
import { RoutePath } from "@esposter/shared";

interface Props {
  draftItem: DraftItem;
}

const { draftItem } = defineProps<Props>();
</script>

<template>
  <MessageDraftsAndSentBaseListItem
    :display-time="getDisplayTime(draftItem.updatedAt)"
    :subtitle="draftItem.content"
    :title="draftItem.threadRootRowKey ? `${draftItem.room.name} — thread` : draftItem.room.name"
    :to="
      draftItem.threadRootRowKey
        ? RoutePath.MessagesThread(draftItem.room.id, draftItem.threadRootRowKey)
        : RoutePath.Messages(draftItem.room.id)
    "
  >
    <template #prepend>
      <StyledAvatar :image="draftItem.room.image" :name="draftItem.room.name" />
    </template>
    <MessageDraftsAndSentDraftDeleteButton :draft-item />
    <MessageDraftsAndSentDraftEditButton :draft-item />
    <MessageDraftsAndSentDraftScheduleButton :draft-item />
    <MessageDraftsAndSentDraftSendButton :draft-item />
  </MessageDraftsAndSentBaseListItem>
</template>
