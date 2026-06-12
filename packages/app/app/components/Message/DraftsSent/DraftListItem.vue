<script setup lang="ts">
import type { DraftItem } from "@/models/message/draftsSent/DraftItem";

import { getDisplayTime } from "@/services/message/draftsSent/getDisplayTime";
import { RoutePath } from "@esposter/shared";

interface MessageDraftsSentDraftListItemProps {
  draftItem: DraftItem;
}

const { draftItem } = defineProps<MessageDraftsSentDraftListItemProps>();
</script>

<template>
  <v-hover #default="{ isHovering, props }">
    <v-list-item :="props" @click="navigateTo(RoutePath.Messages(draftItem.room.id))">
      <template #prepend>
        <StyledAvatar :image="draftItem.room.image" :name="draftItem.room.name" />
      </template>
      <v-list-item-title font-bold>{{ draftItem.room.name }}</v-list-item-title>
      <v-list-item-subtitle>
        <span v-html="draftItem.content" />
      </v-list-item-subtitle>
      <template #append>
        <div flex gap-x-3 items-center>
          <span op-medium-emphasis text-body-small>{{ getDisplayTime(draftItem.updatedAt) }}</span>
          <div v-show="isHovering" p-1 b-1 b-border rd-lg b-solid bg-surface flex items-center>
            <MessageDraftsSentDraftDeleteButton :draft-item />
            <MessageDraftsSentDraftEditButton :draft-item />
            <MessageDraftsSentDraftScheduleButton :draft-item />
            <MessageDraftsSentDraftSendButton :draft-item />
          </div>
        </div>
      </template>
    </v-list-item>
  </v-hover>
</template>
