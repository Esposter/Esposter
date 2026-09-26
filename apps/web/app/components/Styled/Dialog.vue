<script setup lang="ts">
import type { Promisable } from "type-fest";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { DIALOG_CLOSE_DURATION_MS } from "@/services/ui/constants";

interface Props {
  // What confirming does, awaited unless the write is optimistic (useDialogAnswer). A dialog whose confirm submits a
  // Form leaves it to the form's own submit
  confirm?: () => Promisable<unknown>;
  // What confirming does, in the accent: "Save". Absent when the dialog has nothing to confirm — a reference sheet.
  // The whole actions row goes with it, cancel included: there is no pending change for cancel to abandon, and the
  // Title bar's close button is the way out
  confirmLabel?: string;
  // The form the confirm button submits, which makes it the form's submit rather than a click the shell answers
  formId?: string;
  isConfirmDisabled?: true;
  isConfirmPending?: true;
  isOptimistic?: true;
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
const { confirm, confirmLabel, formId, isConfirmDisabled, isConfirmPending, isOptimistic, title } =
  defineProps<Props>();
const { answer, isPending } = useDialogAnswer(isOpen);
const hasActions = computed(() => Boolean(confirmLabel ?? slots["prepend-actions"] ?? slots["prepend-confirm"]));
</script>

<template>
  <!-- One decision about one thing, so it stands in the middle. The body mounts with each open, so a dialog closed
    Holds nothing and every open starts from what its model says -->
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" :title w="[min(36rem,90vw)]" :="$attrs">
    <!-- Held through the dialog's leave, so it rises out with what it showed rather than as an empty frame -->
    <Transition :duration="{ enter: 0, leave: DIALOG_CLOSE_DURATION_MS }">
      <div v-if="isOpen" contents>
        <div v-if="$slots.default" p-3 flex flex-1 flex-col gap-y-4 min-h-0 of-y-auto>
          <slot />
        </div>
        <footer v-if="hasActions" p-3 flex gap-2 items-center>
          <slot name="prepend-actions" />
          <div flex-1 />
          <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
          <!-- A third decision — discard, skip, "export anyway" — stays in the trailing group between the two
            Standing answers, so the row reads cancel → alternative → confirm wherever the dialog appears -->
          <slot name="prepend-confirm" />
          <UiButton
            v-if="confirmLabel"
            :disabled="isConfirmDisabled"
            :is-pending="isConfirmPending || isPending"
            :form="formId"
            :type="formId ? 'submit' : 'button'"
            :variant="UiButtonVariant.Accent"
            @click="
              async () => {
                if (!formId && confirm) await answer(confirm, isOptimistic);
              }
            "
          >
            {{ confirmLabel }}
          </UiButton>
        </footer>
      </div>
    </Transition>
  </UiDialog>
</template>
