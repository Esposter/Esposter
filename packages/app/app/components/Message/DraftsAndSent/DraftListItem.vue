<script setup lang="ts">
import type { DraftItem } from "@/models/message/draftsAndSent/DraftItem";

import { getDisplayTime } from "@/services/message/draftsAndSent/getDisplayTime";
import { RoutePath } from "@esposter/shared";

interface MessageDraftsAndSentDraftListItemProps {
  draftItem: DraftItem;
}

const { draftItem } = defineProps<MessageDraftsAndSentDraftListItemProps>();
</script>

<template>
  <MessageDraftsAndSentBaseListItem
    :display-time="getDisplayTime(draftItem.updatedAt)"
    :subtitle="draftItem.content"
    :title="draftItem.room.name"
    @click="navigateTo(RoutePath.Messages(draftItem.room.id))"
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
