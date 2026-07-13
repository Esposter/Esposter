<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { resourceNameRules } from "@/services/resource/resourceNameRules";

interface ResourceRenameDialogButtonProps {
  rename: (name: string) => Promise<void>;
  resource: Resource;
}

const { rename, resource } = defineProps<ResourceRenameDialogButtonProps>();
const editedName = ref(resource.name);
</script>

<template>
  <StyledFormDialog
    :card-props="{ title: 'Rename resource' }"
    :confirm-button-props="{ text: 'Save' }"
    @submit="
      async (_event, onComplete) => {
        await rename(editedName);
        onComplete();
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-btn
        prepend-icon="mdi-pencil"
        variant="text"
        @click="
          editedName = resource.name;
          updateIsOpen(true);
        "
      >
        Rename
      </v-btn>
    </template>
    <v-text-field v-model="editedName" autofocus label="Name" :rules="resourceNameRules" />
  </StyledFormDialog>
</template>
