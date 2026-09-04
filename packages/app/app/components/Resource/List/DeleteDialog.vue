<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { useListDialogStore } from "@/store/resource/listDialog";
import { RECYCLE_BIN_RETENTION_DAYS } from "@esposter/db-schema";

interface Props {
  resource: Resource;
}

const { resource } = defineProps<Props>();
const emit = defineEmits<{ delete: [resources: Resource[]] }>();
const listDialogStore = useListDialogStore();
const { deletingId } = storeToRefs(listDialogStore);
const { isOpen } = useSingletonDialog(deletingId);
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
    Deleting this resource moves it to the Recycle bin for {{ RECYCLE_BIN_RETENTION_DAYS }} days.
  </StyledDeleteFormDialog>
</template>
