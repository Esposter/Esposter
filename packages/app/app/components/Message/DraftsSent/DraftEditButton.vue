<script setup lang="ts">
import type { DraftItem } from "@/models/message/draftsSent/DraftItem";

import { RoutePath } from "@esposter/shared";

interface MessageDraftsSentDraftEditButtonProps {
  draftItem: DraftItem;
}

const { draftItem } = defineProps<MessageDraftsSentDraftEditButtonProps>();
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
