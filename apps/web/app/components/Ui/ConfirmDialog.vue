<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";

interface Props {
  // What confirming does, in the danger variant: "Delete"
  confirmLabel: string;
  title: string;
}

// A question before something that cannot be undone: what it acts on, Cancel, and the one destructive answer. The
// Answer is pending until the caller completes it, and a failed one keeps the dialog open to try again
defineSlots<{ default: () => VNode }>();
const isOpen = defineModel<boolean>({ default: false });
const { confirmLabel, title } = defineProps<Props>();
const emit = defineEmits<{ confirm: [onComplete: (isSuccessful?: boolean) => void] }>();
const isPending = ref(false);
</script>

<template>
  <UiDialog v-model="isOpen" :title w="[min(32rem,90vw)]">
    <div p-3 flex flex-col gap-3 min-h-0 of-y-auto>
      <slot />
    </div>
    <footer p-3 flex flex-wrap gap-2 justify-end>
      <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
      <UiButton
        :disabled="isPending"
        :variant="UiButtonVariant.Danger"
        flex
        gap-2
        items-center
        @click="
          () => {
            isPending = true;
            emit('confirm', (isSuccessful = true) => {
              if (isSuccessful) isOpen = false;
              isPending = false;
            });
          }
        "
      >
        <UiSpinner v-if="isPending" />
        {{ confirmLabel }}
      </UiButton>
    </footer>
  </UiDialog>
</template>
