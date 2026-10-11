<script setup lang="ts">
import type { Promisable } from "type-fest";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";

interface Props {
  execute: () => Promisable<unknown>;
  submitLabel: string;
  submitVariant: UiButtonVariant;
  title: string;
}

const isOpen = defineModel<boolean>({ default: false });
const { execute, submitLabel, submitVariant, title } = defineProps<Props>();
const { answer, isPending } = useDialogAnswer(isOpen);
</script>

<template>
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" :title w="[min(32rem,90vw)]">
    <UiForm p-3 flex flex-col gap-3 min-h-0 of-y-auto @submit="answer(() => execute())">
      <slot />
      <footer flex gap-2 justify-end>
        <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
        <UiButton :is-pending type="submit" :variant="submitVariant">{{ submitLabel }}</UiButton>
      </footer>
    </UiForm>
  </UiDialog>
</template>
