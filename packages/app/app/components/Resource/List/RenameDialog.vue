<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { resourceNameRules } from "@/services/resource/resourceNameRules";
import { useNotificationStore } from "@/store/notification";
import { useListDialogStore } from "@/store/resource/listDialog";

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
const { cloned: editedName } = useCloned(() => resource.name);
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    :card-props="{ title: 'Rename resource' }"
    :confirm-button-props="{ text: 'Save' }"
    @submit="
      async (_event, onComplete) => {
        let isSuccessful = false;
        await executeMutation(
          () => getResourceMutations(resource.type).updateResource({ id: resource.id, name: editedName }),
          {
            onError: (error) => {
              createNotification({ severity: 'error', title: error.message });
            },
            onSuccess: () => {
              emit('update');
              isSuccessful = true;
            },
          },
        );
        onComplete(isSuccessful);
      }
    "
  >
    <v-text-field v-model="editedName" autofocus label="Name" :rules="resourceNameRules" />
  </StyledFormDialog>
</template>
