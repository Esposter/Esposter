<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  announce: (message: string) => void;
  resourceId: string;
}
const { announce, resourceId } = defineProps<Props>();
</script>

<template>
  <UiEmptyState :meaning="UiIconMeaning.Sheet" title="This page is empty">
    <PageBuilderPalette :announce :resource-id />
  </UiEmptyState>
</template>
