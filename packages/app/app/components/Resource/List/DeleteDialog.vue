<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { useListDialogStore } from "@/store/resource/listDialog";
import { useNotificationStore } from "@/store/notification";

interface ResourceListDeleteDialogProps {
  resource: Resource;
}

const { resource } = defineProps<ResourceListDeleteDialogProps>();
const emit = defineEmits<{ delete: [] }>();
const { $trpc } = useNuxtApp();
const executeMutation = useMutation();
const listDialogStore = useListDialogStore();
const { deletingId } = storeToRefs(listDialogStore);
const isOpen = useSingletonDialog(deletingId);
const notificationStore = useNotificationStore();
const { createNotification } = notificationStore;
// Double quotes cannot appear in a template attribute expression
const deletedNotificationTitle = computed(() => `Deleted "${resource.name}"`);
</script>

<template>
  <StyledDeleteFormDialog
    v-model="isOpen"
    :card-props="{ title: 'Delete resource' }"
    :confirm-name="resource.name"
    @delete="
      async (onComplete) => {
        let isSuccessful = false;
        // The batch procedure with one id shares the exact cleanup path (row + publication + blob directory)
        await executeMutation(() => $trpc.resource.deleteResources.mutate({ ids: [resource.id] }), {
          onError: (error) => {
            createNotification({ severity: 'error', title: error.message });
          },
          onSuccess: () => {
            createNotification({ severity: 'success', title: deletedNotificationTitle });
            emit('delete');
            isSuccessful = true;
          },
        });
        onComplete(isSuccessful);
      }
    "
  >
    Delete "{{ resource.name }}"? This cannot be undone.
  </StyledDeleteFormDialog>
</template>
