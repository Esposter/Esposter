<script setup lang="ts">
import type { ResourceInResource } from "@esposter/db-schema";

import { UiRules } from "@/services/ui/UiRules";
import { RESOURCE_NAME_MAX_LENGTH } from "@esposter/db-schema";

interface Props {
  rename: (name: string) => Promise<void>;
  resource: ResourceInResource;
}

const isOpen = defineModel<boolean>({ default: false });
const { resource } = defineProps<Props>();
// The caller mounts this only while it is open, so the field starts from the current name on every open
const editedName = ref(resource.name);
const nameRules = [UiRules.required(), UiRules.maxLength(RESOURCE_NAME_MAX_LENGTH)];
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    confirm-label="Save"
    is-optimistic
    :submit="() => rename(editedName)"
    title="Rename resource"
  >
    <UiTextField v-model="editedName" is-autofocus label="Name" :rules="nameRules" />
  </StyledFormDialog>
</template>
