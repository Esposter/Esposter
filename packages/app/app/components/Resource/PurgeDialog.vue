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
  <StyledDeleteFormDialog
    v-model="isOpen"
    :card-props="{ title: 'Delete forever' }"
    :confirm-button-props="{ text: 'Delete forever' }"
    :confirm-name="resource.name"
    @delete="
      (onComplete) => {
        // Closing before the emit: the refresh drops the row, which unmounts this v-if-gated dialog,
        // So the purge must be owned by the page and this dialog must not outlive the confirm
        onComplete();
        emit('purge', resource);
      }
    "
  >
    Permanently deleting this resource destroys its contents. This cannot be undone.
  </StyledDeleteFormDialog>
</template>
