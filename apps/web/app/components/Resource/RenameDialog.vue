<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
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
const isValid = ref(true);
const nameRules = computed(() => [rules.required(), rules.maxLength(RESOURCE_NAME_MAX_LENGTH)]);
</script>

<template>
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" title="Rename resource" w="[min(32rem,90vw)]">
    <UiForm
      v-model:is-valid="isValid"
      p-3
      flex
      flex-col
      gap-3
      @submit="
        async () => {
          // Every rename applies optimistically, so the dialog has nothing to wait for — it closes on submit, and
          // That unmount is the whole in-flight guard. Started before the close because closing clears the dialog
          // Target a list-owned rename resolves itself from, and awaited after it so nothing is left floating
          const renamePromise = rename(editedName);
          isOpen = false;
          await renamePromise;
        }
      "
    >
      <UiTextField v-model="editedName" is-autofocus label="Name" :rules="nameRules" />
      <footer flex gap-2 justify-end>
        <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
        <UiButton :disabled="!isValid" type="submit" :variant="UiButtonVariant.Accent">Save</UiButton>
      </footer>
    </UiForm>
  </UiDialog>
</template>
