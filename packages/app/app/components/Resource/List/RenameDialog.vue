<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { resourceNameRules } from "@/services/resource/resourceNameRules";
import { useListDialogStore } from "@/store/resource/listDialog";
import { useNotificationStore } from "@/store/notification";

interface ResourceListRenameDialogProps {
  resource: Resource;
}

const { resource } = defineProps<ResourceListRenameDialogProps>();
const emit = defineEmits<{ update: [] }>();
const executeMutation = useMutation();
const listDialogStore = useListDialogStore();
const { renamingId } = storeToRefs(listDialogStore);
const isOpen = useSingletonDialog(renamingId);
const notificationStore = useNotificationStore();
const { createNotification } = notificationStore;
const getResourceMutations = useResourceMutations();
const renameValue = ref(resource.name);
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    :card-props="{ title: 'Rename resource' }"
    :confirm-button-props="{ text: 'Save' }"
    @submit="
      async (_event, onComplete) => {
        await executeMutation(
          () => getResourceMutations(resource.type).updateResource({ id: resource.id, name: renameValue }),
          {
            onError: (error) => {
              createNotification({ severity: 'error', title: error.message });
            },
            onSuccess: () => {
              emit('update');
            },
          },
        );
        onComplete();
      }
    "
  >
    <v-text-field v-model="renameValue" autofocus label="Name" :rules="resourceNameRules" />
  </StyledFormDialog>
</template>
