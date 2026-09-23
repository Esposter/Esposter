<script setup lang="ts">
import type { UiButtonVariant } from "@/models/ui/UiButtonVariant";

import { Button } from "@vuetify/v0";

interface Props {
  disabled?: boolean;
  variant?: UiButtonVariant;
}

// The button is ours to render rather than the primitive's, which lays its own attributes over the ones passed to it:
// A submit button's type and a toggle's pressed state are the call site's to set
defineOptions({ inheritAttrs: false });
defineSlots<{ default: () => VNode }>();
const { disabled, variant } = defineProps<Props>();
// The primitive renders nothing of its own, so the component's root is not the button: what anchors a popover or
// Takes focus back reads the element here
const element = useTemplateRef("element");

defineExpose({ element });
</script>

<template>
  <Button.Root #default="{ attrs }" :disabled renderless>
    <button
      ref="element"
      v-bind="{ ...attrs, ...$attrs }"
      class="button"
      :data-variant="variant"
      px-2
      shrink-0
      cursor-pointer
      ui-raised
      disabled:cursor-default
      hover:brightness-125
      disabled:op-disabled
    >
      <slot />
    </button>
  </Button.Root>
</template>

<style scoped>
.button[aria-pressed="true"],
.button[data-variant="Accent"] {
  background-color: var(--ui-accent);
  color: var(--ui-background);
}

.button[data-variant="Danger"] {
  background-color: var(--ui-error);
  color: var(--ui-background);
}

/* No surface of its own, so it can float over content; the panel's colour under it keeps it legible there */
.button[data-variant="Quiet"] {
  background-color: var(--ui-panel);
  box-shadow: none;
  color: var(--ui-muted);
}
</style>
