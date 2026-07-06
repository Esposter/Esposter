<script setup lang="ts">
import type { Document } from "@esposter/db-schema";

import { useAlertStore } from "@/store/alert";
import { getResultAsync } from "@esposter/shared";

interface DocumentPublishButtonProps {
  document: Document;
  // Public route prefix for viewing the published document, e.g. "/view/dashboard"
  viewPath: string;
}

const { document, viewPath } = defineProps<DocumentPublishButtonProps>();
const emit = defineEmits<{ publish: []; unpublish: [] }>();
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const viewUrl = computed(() => `${window.location.origin}${viewPath}/${document.id}`);
const copyViewUrl = () =>
  getResultAsync(() => window.navigator.clipboard.writeText(viewUrl.value)).match(
    () => createAlert("Copied public link", "success"),
    () => createAlert("Failed to copy public link", "error"),
  );
</script>

<template>
  <StyledTooltipIconButton
    :icon="document.publishedAt ? 'mdi-publish' : 'mdi-publish-off'"
    :text="document.publishedAt ? 'Republish' : 'Publish'"
    @click="emit('publish')"
  />
  <template v-if="document.publishedAt">
    <StyledTooltipIconButton icon="mdi-link-variant" text="Copy public link" @click="copyViewUrl()" />
    <StyledTooltipIconButton icon="mdi-cancel" text="Unpublish" @click="emit('unpublish')" />
  </template>
</template>
