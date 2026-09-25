<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";

interface Props {
  // What confirming does, in the accent: "Save". Absent when the dialog has nothing to confirm — a reference sheet.
  // The whole actions row goes with it, cancel included: there is no pending change for cancel to abandon, and the
  // Title bar's close button is the way out
  confirmLabel?: string;
  // The form the confirm button submits, which makes it the form's submit rather than a click the shell answers
  formId?: string;
  isConfirmDisabled?: true;
  isConfirmPending?: true;
  title: string;
}

// What a call site passes goes to the dialog element, which it sizes
defineOptions({ inheritAttrs: false });
const slots = defineSlots<{
  default?: () => VNode;
  "prepend-actions"?: () => VNode;
  "prepend-confirm"?: () => VNode;
}>();
const isOpen = defineModel<boolean>({ default: false });
const { confirmLabel, formId, isConfirmDisabled, isConfirmPending, title } = defineProps<Props>();
const emit = defineEmits<{ confirm: [onComplete: () => void] }>();
const hasActions = computed(() => Boolean(confirmLabel ?? slots["prepend-actions"] ?? slots["prepend-confirm"]));
</script>

<template>
  <!-- One decision about one thing, so it stands in the middle. The body mounts with each open, so a dialog closed
    Holds nothing and every open starts from what its model says -->
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" :title w="[min(36rem,90vw)]" :="$attrs">
    <template v-if="isOpen">
      <div v-if="$slots.default" p-3 flex flex-1 flex-col gap-y-4 min-h-0 of-y-auto>
        <slot />
      </div>
      <footer v-if="hasActions" p-3 flex gap-2 items-center>
        <slot name="prepend-actions" />
        <div flex-1 />
        <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
        <!-- A third decision — discard, skip, "export anyway" — stays in the trailing group between the two standing
          Answers, so the row reads cancel → alternative → confirm wherever the dialog appears -->
        <slot name="prepend-confirm" />
        <UiButton
          v-if="confirmLabel"
          :disabled="isConfirmDisabled || isConfirmPending"
          :form="formId"
          :type="formId ? 'submit' : 'button'"
          :variant="UiButtonVariant.Accent"
          @click="
            () => {
              if (!formId) emit('confirm', () => (isOpen = false));
            }
          "
        >
          <UiSpinner v-if="isConfirmPending" />
          {{ confirmLabel }}
        </UiButton>
      </footer>
    </template>
  </UiDialog>
</template>
