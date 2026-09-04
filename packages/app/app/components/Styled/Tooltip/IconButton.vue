<script setup lang="ts">
import type { VBtn, VTooltip } from "vuetify/components";

interface Props {
  buttonProps?: VBtn["$props"];
  icon: string;
  isIconButton?: false;
  text?: string;
  tooltipProps?: VTooltip["$props"];
}
// The root is VTooltip, whose fallthrough attrs land on VOverlay's popup element instead of the button —
// So `to`, `disabled` and styling attrs would silently decorate the tooltip. Route them to the button, which
// Is what every call site means by them; an explicit buttonProps entry still wins over the same attr
defineOptions({ inheritAttrs: false });
defineSlots<{ default?: () => VNode }>();
const { buttonProps, icon, isIconButton = true, text, tooltipProps } = defineProps<Props>();
const emit = defineEmits<{ click: [event: MouseEvent] }>();
</script>

<template>
  <v-tooltip :text :="tooltipProps">
    <template #activator="{ props }">
      <v-btn v-if="isIconButton" :icon :="{ ...props, ...$attrs, ...buttonProps }" @click="emit('click', $event)" />
      <v-btn v-else :="{ ...props, ...$attrs, ...buttonProps }" @click="emit('click', $event)">
        <v-icon :icon />
      </v-btn>
    </template>
    <!-- The explicit #default is required: v-slot + v-if compiles to conditional slot registration,
      while a bare template v-if always registers the slot, suppressing VTooltip's text prop -->
    <template v-if="$slots.default" #default>
      <slot />
    </template>
  </v-tooltip>
</template>
