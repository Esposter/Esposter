<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { useListDialogStore } from "@/store/resource/listDialog";

interface ResourceListDeleteDialogProps {
  resource: Resource;
}

const { resource } = defineProps<ResourceListDeleteDialogProps>();
const emit = defineEmits<{ delete: [resources: Resource[]] }>();
const listDialogStore = useListDialogStore();
const { deletingId } = storeToRefs(listDialogStore);
const isOpen = useSingletonDialog(deletingId);
</script>

<template>
  <StyledDeleteFormDialog
    v-model="isOpen"
    :card-props="{ title: 'Delete resource' }"
    :confirm-name="resource.name"
    @delete="
      (onComplete) => {
        // Closing before the emit: the list drops the row optimistically, which unmounts this v-if-gated dialog,
        // So the delete must be owned by the list and this dialog must not outlive the confirm
        onComplete();
        emit('delete', [resource]);
      }
    "
  >
    Delete "{{ resource.name }}"? This cannot be undone.
  </StyledDeleteFormDialog>
</template>
