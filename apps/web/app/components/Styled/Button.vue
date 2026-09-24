<script setup lang="ts">
import type { VBtn } from "vuetify/components";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { getUiButtonProps } from "@/services/styled/getUiButtonProps";

interface Props {
  buttonProps?: VBtn["$props"];
  // A few call sites pass these beside buttonProps rather than inside it, and an attribute is not reactive to read
  disabled?: boolean;
  loading?: boolean;
  text?: string;
}

// The library's button behind the Vuetify props its call sites still pass: the one primary action of a surface, so it
// Leads in the accent unless its props say otherwise
defineOptions({ inheritAttrs: false });
defineSlots<{ default?: () => VNode }>();
const { buttonProps, disabled, loading, text } = defineProps<Props>();
const uiButtonProps = computed(() =>
  getUiButtonProps({ disabled, loading, text, ...buttonProps }, UiButtonVariant.Accent),
);
</script>

<template>
  <UiButton
    :="{ ...uiButtonProps.attributes, ...$attrs }"
    :disabled="uiButtonProps.isDisabled"
    :variant="uiButtonProps.variant"
  >
    <UiSpinner v-if="uiButtonProps.isLoading" />
    <span v-else-if="uiButtonProps.icon" :class="uiButtonProps.icon" shrink-0 size-5 />
    <slot>{{ uiButtonProps.text }}</slot>
  </UiButton>
</template>
