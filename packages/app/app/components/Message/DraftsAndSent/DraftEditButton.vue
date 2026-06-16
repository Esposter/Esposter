<script setup lang="ts">
import type { DraftItem } from "@/models/message/draftsAndSent/DraftItem";

import { RoutePath } from "@esposter/shared";

interface MessageDraftsAndSentDraftEditButtonProps {
  draftItem: DraftItem;
}

const { draftItem } = defineProps<MessageDraftsAndSentDraftEditButtonProps>();
</script>

<template>
  <v-tooltip text="Edit draft">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        :="tooltipProps"
        density="comfortable"
        icon="mdi-pencil-outline"
        size="small"
        variant="text"
        @click.stop="navigateTo(RoutePath.Messages(draftItem.room.id))"
      />
    </template>
  </v-tooltip>
</template>
