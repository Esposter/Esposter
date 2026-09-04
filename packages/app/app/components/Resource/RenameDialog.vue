<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { RESOURCE_NAME_MAX_LENGTH } from "@esposter/db-schema";

interface Props {
  rename: (name: string) => Promise<void>;
  resource: Resource;
}

const isOpen = defineModel<boolean>({ default: false });
const { rename, resource } = defineProps<Props>();
const rules = useVRules();
// The caller mounts this only while it is open, so the field starts from the current name on every open
const editedName = ref(resource.name);
const nameRules = computed(() => [rules.required(), rules.maxLength(RESOURCE_NAME_MAX_LENGTH)]);
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    :card-props="{ title: 'Rename resource' }"
    :confirm-button-props="{ text: 'Save' }"
    @submit="
      async (_event, onComplete) => {
        // Every rename applies optimistically, so the dialog has nothing to wait for — it closes on submit, and
        // That unmount is the whole in-flight guard. Started before the close because closing clears the dialog
        // Target a list-owned rename resolves itself from, and awaited after it so nothing is left floating
        const renamePromise = rename(editedName);
        onComplete();
        await renamePromise;
      }
    "
  >
    <v-text-field v-model="editedName" autofocus label="Name" :rules="nameRules" />
  </StyledFormDialog>
</template>
