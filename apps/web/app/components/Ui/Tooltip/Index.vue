<script setup lang="ts">
import type { UiTooltipActivatorProps } from "@/models/ui/UiTooltipActivatorProps";

import { POPOVER_POSITION_TRY, TOOLTIP_NAMESPACE, TOOLTIP_POSITION_AREA } from "@/services/ui/constants";
import { Tooltip } from "@vuetify/v0";

interface Props {
  isDisabled?: boolean;
  label: string;
}
// A short label beside what it names, opened by hovering it or reaching it by keyboard. The element is the caller's,
// Which binds the activator props onto it, so a tooltip adds no wrapper to a layout
defineSlots<{
  // What the tooltip shows in place of its label, where the label alone would drop something: a time to render
  content?: () => VNode;
  default: (props: { activatorProps: UiTooltipActivatorProps }) => VNode;
}>();
const { isDisabled, label } = defineProps<Props>();
</script>

<template>
  <Tooltip.Root
    :disabled="isDisabled"
    :namespace="TOOLTIP_NAMESPACE"
    :open-delay="0"
    :position-area="TOOLTIP_POSITION_AREA"
    :position-try="POPOVER_POSITION_TRY"
  >
    <Tooltip.Activator
      #default="{ attrs: { onBlur, onClick, onFocus, onKeydown, onPointerenter, onPointerleave }, styles }"
      :namespace="TOOLTIP_NAMESPACE"
      renderless
    >
      <slot :activator-props="{ onBlur, onClick, onFocus, onKeydown, onPointerenter, onPointerleave, style: styles }" />
    </Tooltip.Activator>
    <UiTooltipContent>
      <slot name="content">{{ label }}</slot>
    </UiTooltipContent>
  </Tooltip.Root>
</template>
