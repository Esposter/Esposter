<script setup lang="ts">
import type { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";

import { mergeProps } from "vue";

interface Props {
  // Its accessible name and its tooltip at once, so an icon button is never left unnamed
  label: string;
  meaning: UiIconMeaning;
  variant?: UiButtonVariant;
}
// The tooltip renders no element of its own, so what a call site passes goes to the button
defineOptions({ inheritAttrs: false });
const { label, meaning, variant } = defineProps<Props>();
</script>

<template>
  <UiTooltip #default="{ activatorProps }" :label>
    <UiButton :="mergeProps(activatorProps, $attrs)" :aria-label="label" :variant px-0>
      <UiIcon :meaning />
    </UiButton>
  </UiTooltip>
</template>
