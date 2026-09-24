<script setup lang="ts">
import type { DraftItem } from "@/models/message/draftsAndSent/DraftItem";

import { getDraftItemRoute } from "@/services/message/draftsAndSent/getDraftItemRoute";

interface Props {
  draftItem: DraftItem;
}

const { draftItem } = defineProps<Props>();
</script>

<template>
  <MessageDraftsAndSentActionButton
    icon="i-mdi:pencil-outline"
    text="Edit draft"
    @click="navigateTo(getDraftItemRoute(draftItem))"
  />
</template>
