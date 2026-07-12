<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { resourceNameRules } from "@/services/resource/resourceNameRules";
import { useListDialogStore } from "@/store/resource/listDialog";
import { useNotificationStore } from "@/store/notification";
import { getResultAsync } from "@esposter/shared";

interface ResourceListRenameDialogProps {
  resource: Resource;
}

const { resource } = defineProps<ResourceListRenameDialogProps>();
const emit = defineEmits<{ updated: [] }>();
const listDialogStore = useListDialogStore();
const { renamingId } = storeToRefs(listDialogStore);
const isOpen = useSingletonDialog(renamingId);
const notificationStore = useNotificationStore();
const { createNotification } = notificationStore;
const getResourceMutations = useResourceMutations();
const renameValue = ref(resource.name);
const rename = () =>
  getResultAsync(() =>
    getResourceMutations(resource.type).updateResource({ id: resource.id, name: renameValue.value }),
  ).match(
    () => {
      emit("updated");
    },
    (error) => {
      createNotification({ severity: "error", title: error.message });
    },
  );
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    :card-props="{ title: 'Rename resource' }"
    :confirm-button-props="{ text: 'Save' }"
    @submit="
      async (_event, onComplete) => {
        await rename();
        onComplete();
      }
    "
  >
    <v-text-field v-model="renameValue" autofocus label="Name" :rules="resourceNameRules" />
  </StyledFormDialog>
</template>
