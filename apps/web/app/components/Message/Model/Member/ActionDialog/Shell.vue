<script setup lang="ts">
import type { ExecuteAdminActionInput } from "#shared/models/db/moderation/ExecuteAdminActionInput";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { UiDialogSize } from "@/models/ui/UiDialogSize";

interface Props {
  getInput: (roomId: string) => ExecuteAdminActionInput;
  submitLabel: string;
  submitVariant: UiButtonVariant;
  title: string;
}

const isOpen = defineModel<boolean>({ default: false });
defineProps<Props>();
const executeAdminAction = useExecuteAdminAction();
const { answer, isPending } = useDialogAnswer(isOpen);
// The submit sits in the footer, beside the form it submits, so it names the form by id
const formId = useId();
</script>

<template>
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" :title :size="UiDialogSize.Medium">
    <UiForm :id="formId" flex flex-col gap-3 @submit="answer(() => executeAdminAction(getInput))">
      <slot />
    </UiForm>
    <template #footer>
      <UiButton :variant="UiButtonVariant.Quiet" autofocus @click="isOpen = false">Cancel</UiButton>
      <UiButton :is-pending :form="formId" type="submit" :variant="submitVariant">{{ submitLabel }}</UiButton>
    </template>
  </UiDialog>
</template>
