<script setup lang="ts">
import type { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";

import { mergeProps } from "vue";

interface Props {
  isPending?: boolean;
  // Its accessible name and its tooltip at once, so an icon button is never left unnamed
  label: string;
  meaning: UiIconMeaning;
  // In Vuetify 0's hotkey syntax, drawn in the tooltip beside the label: the shortcut of the command the button runs
  shortcut?: string;
  variant?: UiButtonVariant;
}
// The tooltip renders no element of its own, so what a call site passes goes to the button
defineOptions({ inheritAttrs: false });
const { isPending, label, meaning, shortcut, variant } = defineProps<Props>();
</script>

<!-- A pending button's spinner takes the icon's place, since the button is only as wide as one -->
<template>
  <UiTooltip #default="{ activatorProps }" :label>
    <template v-if="shortcut" #content>
      <span flex gap-2 items-center>{{ label }} <UiShortcut :shortcut /></span>
    </template>
    <UiButton :="mergeProps(activatorProps, $attrs)" :aria-label="label" :is-pending :variant px-0>
      <UiIcon v-if="!isPending" :meaning />
    </UiButton>
  </UiTooltip>
</template>
