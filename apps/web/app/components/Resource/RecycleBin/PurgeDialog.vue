<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";
import type { Promisable } from "type-fest";

import { useRecycleBinDialogStore } from "@/store/resource/recycleBinDialog";

interface Props {
  // Passed in rather than emitted, so the confirm awaits the write it makes
  purge: (resource: Resource) => Promisable<unknown>;
  resource: Resource;
}

const { purge, resource } = defineProps<Props>();
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
    is-optimistic
    :confirm="() => purge(resource)"
  >
    Permanently deleting this resource destroys its contents. This cannot be undone.
  </UiConfirmDialog>
</template>
