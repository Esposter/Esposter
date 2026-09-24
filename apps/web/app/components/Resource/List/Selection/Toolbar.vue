<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";

interface Props {
  selectedResources: Resource[];
}

const { selectedResources } = defineProps<Props>();
const emit = defineEmits<{ clear: []; delete: [resources: Resource[]] }>();
</script>

<!-- Stands where the filters were while rows are selected, since what is done to a selection comes first then -->
<template>
  <div role="toolbar" aria-label="Selected resources" px-4 pb-2 flex flex-wrap gap-2 items-center>
    <span text-muted>{{ selectedResources.length }} selected</span>
    <ResourceListSelectionDeleteButton :selected-resources @delete="emit('delete', $event)" />
    <ResourceListSelectionExportButton :selected-resources />
    <ResourceListSelectionCaptureBlueprintButton :selected-resources />
    <UiButton :variant="UiButtonVariant.Quiet" ml-a @click="emit('clear')">Clear</UiButton>
  </div>
</template>
