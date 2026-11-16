<script setup lang="ts">
import type { ExecuteAdminActionInput } from "#shared/models/db/moderation/ExecuteAdminActionInput";

import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "#src/models/ui/UiDialogPlacement";
import { UiDialogSize } from "#src/models/ui/UiDialogSize";

interface Props {
  getInput: (roomId: string) => ExecuteAdminActionInput;
  submitLabel: string;
  submitVariant: UiButtonVariant;
  title: string;
}

defineSlots<{ default: () => VNode }>();
const isOpen = defineModel<boolean>({ default: false });
defineProps<Props>();
const executeAdminAction = useExecuteAdminAction();
const { answer, isPending } = useDialogAnswer(isOpen);
</script>

<template>
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" :title is-size-fixed :size="UiDialogSize.Medium">
    <template #default="{ formId }">
      <UiForm
        :id="formId"
        flex
        flex-col
        gap-3
        @submit="answer(() => executeAdminAction(getInput), AwaitedReason.ServerDecidedOutcome)"
      >
        <slot />
      </UiForm>
    </template>
    <template #footer="{ formId }">
      <UiButton is-autofocus :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
      <UiButton :is-pending :form="formId" type="submit" :variant="submitVariant">{{ submitLabel }}</UiButton>
    </template>
  </UiDialog>
</template>
