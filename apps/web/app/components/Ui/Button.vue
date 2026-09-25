<script setup lang="ts">
import type { UiButtonVariant } from "@/models/ui/UiButtonVariant";

import { Button } from "@vuetify/v0";

interface Props {
  disabled?: boolean;
  // A write it started is still out: pressing again would only send it twice, so it holds disabled with a spinner
  // Ahead of its content until the write settles
  isPending?: boolean;
  variant?: UiButtonVariant;
}
// The button is ours to render rather than the primitive's, which lays its own attributes over the ones passed to it:
// A submit button's type and a toggle's pressed state are the call site's to set
defineOptions({ inheritAttrs: false });
defineSlots<{ default: () => VNode }>();
const { disabled, isPending, variant } = defineProps<Props>();
// The primitive renders nothing of its own, so the component's root is not the button: what anchors a popover or
// Takes focus back reads the element here
const element = useTemplateRef("element");

defineExpose({ element });
</script>

<template>
  <Button.Root #default="{ attrs }" :disabled="disabled || isPending" renderless>
    <button
      ref="element"
      :="{ ...attrs, ...$attrs }"
      :aria-busy="isPending || undefined"
      :data-variant="variant"
      ui-button
    >
      <UiSpinner v-if="isPending" />
      <slot />
    </button>
  </Button.Root>
</template>
