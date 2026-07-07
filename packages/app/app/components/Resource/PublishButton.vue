<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { useAlertStore } from "@/store/alert";
import { getResultAsync } from "@esposter/shared";

interface ResourcePublishButtonProps {
  // Publish state is normalized off the resource row, so it is passed in explicitly
  isPublished: boolean;
  resource: Resource;
  // Builds the public route for viewing the published resource, e.g. RoutePath.ViewDashboard
  viewPath: (id: string) => string;
}

const { isPublished, resource, viewPath } = defineProps<ResourcePublishButtonProps>();
const emit = defineEmits<{ publish: []; unpublish: [] }>();
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const viewUrl = computed(() => `${window.location.origin}${viewPath(resource.id)}`);
const copyViewUrl = () =>
  getResultAsync(() => window.navigator.clipboard.writeText(viewUrl.value)).match(
    () => createAlert("Copied public link", "success"),
    () => createAlert("Failed to copy public link", "error"),
  );
</script>

<template>
  <StyledTooltipIconButton
    :icon="isPublished ? 'mdi-publish' : 'mdi-publish-off'"
    :text="isPublished ? 'Republish' : 'Publish'"
    @click="emit('publish')"
  />
  <template v-if="isPublished">
    <StyledTooltipIconButton icon="mdi-link-variant" text="Copy public link" @click="copyViewUrl()" />
    <StyledTooltipIconButton icon="mdi-cancel" text="Unpublish" @click="emit('unpublish')" />
  </template>
</template>
