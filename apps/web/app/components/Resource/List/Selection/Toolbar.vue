<script setup lang="ts">
import type { Item } from "@/models/shared/Item";
import type { Resource } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useBlueprintCaptureDialogStore } from "@/store/resource/blueprint/captureDialog";

interface Props {
  selectedResources: Resource[];
}

const { selectedResources } = defineProps<Props>();
const emit = defineEmits<{ clear: []; delete: [resources: Resource[]] }>();
const blueprintCaptureDialogStore = useBlueprintCaptureDialogStore();
const { captureIds } = storeToRefs(blueprintCaptureDialogStore);
const { exportResourcesCsv } = useExportResourcesCsv();
// Delete is what a selection is most often made for, so it stays out; the rest wait in the overflow menu, which keeps
// The bar on one line however narrow the screen
const items = computed<Item[]>(() => [
  {
    meaning: UiIconMeaning.Download,
    onClick: async () => {
      await exportResourcesCsv(selectedResources);
    },
    title: "Export CSV",
  },
  {
    meaning: UiIconMeaning.Blueprint,
    onClick: () => {
      captureIds.value = selectedResources.map(({ id }) => id);
    },
    title: "Save as blueprint",
  },
]);
</script>

<!-- Stands where the filters were while rows are selected, since what is done to a selection comes first then. It
     leads with the way out of the selection, as a selection bar does, and the count yields its width to the commands -->
<template>
  <div role="toolbar" aria-label="Selected resources" px-4 pb-2 flex gap-2 items-center>
    <UiIconButton
      label="Clear selection"
      :meaning="UiIconMeaning.Close"
      :variant="UiButtonVariant.Quiet"
      @click="emit('clear')"
    />
    <span flex-1 min-w-0 truncate>{{ selectedResources.length }} selected</span>
    <!-- Deleting moves the selection to the Recycle bin, and the toast it leaves brings it back, so it asks nothing -->
    <UiButton :variant="UiButtonVariant.Danger" @click="emit('delete', selectedResources)">Delete</UiButton>
    <UiOverflowMenu :items label="Selection actions" />
  </div>
</template>
