<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { UiRules } from "@/services/ui/UiRules";
import { RESOURCE_NAME_MAX_LENGTH } from "@esposter/db-schema";

interface Props {
  rename: (name: string) => Promise<void>;
  resource: Resource;
}

const isOpen = defineModel<boolean>({ default: false });
const { rename, resource } = defineProps<Props>();
// The caller mounts this only while it is open, so the field starts from the current name on every open
const editedName = ref(resource.name);
const isValid = ref(true);
const nameRules = [UiRules.required(), UiRules.maxLength(RESOURCE_NAME_MAX_LENGTH)];
const { answer } = useDialogAnswer(isOpen);
</script>

<template>
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" title="Rename resource" w="[min(32rem,90vw)]">
    <UiForm v-model:is-valid="isValid" p-3 flex flex-col gap-3 @submit="answer(() => rename(editedName), true)">
      <UiTextField v-model="editedName" is-autofocus label="Name" :rules="nameRules" />
      <footer flex gap-2 justify-end>
        <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
        <UiButton :disabled="!isValid" type="submit" :variant="UiButtonVariant.Accent">Save</UiButton>
      </footer>
    </UiForm>
  </UiDialog>
</template>
