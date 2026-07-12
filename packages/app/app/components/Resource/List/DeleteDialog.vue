<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { useListDialogStore } from "@/store/resource/listDialog";
import { useNotificationStore } from "@/store/notification";
import { getResultAsync } from "@esposter/shared";

interface ResourceListDeleteDialogProps {
  resource: Resource;
}

const { resource } = defineProps<ResourceListDeleteDialogProps>();
const emit = defineEmits<{ deleted: [] }>();
const { $trpc } = useNuxtApp();
const listDialogStore = useListDialogStore();
const { deletingId } = storeToRefs(listDialogStore);
const isOpen = useSingletonDialog(deletingId);
const notificationStore = useNotificationStore();
const { createNotification } = notificationStore;
// The batch procedure with one id shares the exact cleanup path (row + publication + blob directory)
const deleteResource = () =>
  getResultAsync(() => $trpc.resource.deleteResources.mutate({ ids: [resource.id] })).match(
    () => {
      createNotification({ severity: "success", title: `Deleted "${resource.name}"` });
      emit("deleted");
    },
    (error) => {
      createNotification({ severity: "error", title: error.message });
    },
  );
</script>

<template>
  <StyledDeleteFormDialog
    v-model="isOpen"
    :card-props="{ title: 'Delete resource' }"
    :confirm-name="resource.name"
    @delete="
      async (onComplete) => {
        await deleteResource();
        onComplete();
      }
    "
  >
    Delete "{{ resource.name }}"? This cannot be undone.
  </StyledDeleteFormDialog>
</template>
