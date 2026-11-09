<script setup lang="ts">
import type { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";

import { mergeProps } from "vue";

interface Props {
  // Why the button is unavailable now. It is drawn disabled but stays focusable and hoverable, so its tooltip can say the
  // Reason after its label; a click is still delivered, so the action it runs refuses it
  disabledReason?: string;
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
defineProps<Props>();
</script>

<!-- A pending button's spinner takes the icon's place, since the button is only as wide as one -->
<template>
  <UiTooltip :label>
    <template v-if="disabledReason || shortcut" #content>
      <span flex gap-2 items-center>
        <span>{{ label }}<template v-if="disabledReason">. {{ disabledReason }}</template></span>
        <UiShortcut v-if="shortcut" :shortcut />
      </span>
    </template>
    <template #default="{ activatorProps }">
      <UiButton
        :="mergeProps(activatorProps, $attrs, disabledReason ? { 'aria-disabled': true } : {})"
        :aria-label="label"
        class="aria-disabled:op-disabled"
        :is-pending
        :variant
        px-0
      >
        <UiIcon v-if="!isPending" :meaning />
      </UiButton>
    </template>
  </UiTooltip>
</template>
