<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { useRecycleBinDialogStore } from "@/store/resource/recycleBinDialog";

interface Props {
  resource: Resource;
}

const { resource } = defineProps<Props>();
const emit = defineEmits<{ purge: [resource: Resource] }>();
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
    :confirm="() => emit('purge', resource)"
  >
    Permanently deleting this resource destroys its contents. This cannot be undone.
  </UiConfirmDialog>
</template>
