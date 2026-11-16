<script setup lang="ts">
import type { ResourceInResource } from "@esposter/db-schema";

import { useRecycleBinDialogStore } from "#src/store/resource/recycleBinDialog";

interface Props {
  // Passed in rather than emitted, so the purge is made against the bin's own rows the moment the confirm is pressed
  purge: (resource: ResourceInResource) => void;
  resource: ResourceInResource;
}

defineProps<Props>();
const recycleBinDialogStore = useRecycleBinDialogStore();
const { purgingId } = storeToRefs(recycleBinDialogStore);
const { isOpen } = useSingletonDialog(purgingId);
</script>

<template>
  <UiConfirmDialog
    v-model="isOpen"
    confirm-label="Delete forever"
    :confirm-name="resource.name"
    title="Delete forever"
    :confirm="() => purge(resource)"
  >
    Permanently deleting this resource destroys its contents. This cannot be undone.
  </UiConfirmDialog>
</template>
