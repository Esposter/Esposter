<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { resourceNameRules } from "@/services/resource/resourceNameRules";

interface ResourceRenameDialogProps {
  rename: (name: string) => Promise<void>;
  resource: Resource;
}

const isOpen = defineModel<boolean>({ default: false });
const { rename, resource } = defineProps<ResourceRenameDialogProps>();
// The caller mounts this only while it is open, so the field starts from the current name on every open
const editedName = ref(resource.name);
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    :card-props="{ title: 'Rename resource' }"
    :confirm-button-props="{ text: 'Save' }"
    @submit="
      async (_event, onComplete) => {
        await rename(editedName);
        onComplete();
      }
    "
  >
    <v-text-field v-model="editedName" autofocus label="Name" :rules="resourceNameRules" />
  </StyledFormDialog>
</template>
