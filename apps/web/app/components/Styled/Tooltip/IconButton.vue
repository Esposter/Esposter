<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";
import type { VBtn, VTooltip } from "vuetify/components";

import { getUiButtonProps } from "@/services/styled/getUiButtonProps";
import { mergeProps } from "vue";

interface Props {
  buttonProps?: VBtn["$props"];
  icon: string;
  text?: string;
  to?: RouteLocationRaw;
  // Only its text is read: the library places every tooltip itself, below what it names unless there is no room
  tooltipProps?: VTooltip["$props"];
}

// The library's icon button behind the Vuetify props its call sites still pass, with the icon class they name. The
// Tooltip renders no element of its own, so what a call site passes goes to the button
defineOptions({ inheritAttrs: false });
defineSlots<{ default?: () => VNode }>();
const { buttonProps = {}, icon, text, to, tooltipProps } = defineProps<Props>();
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const label = computed(() => text ?? tooltipProps?.text ?? "");
const uiButtonProps = computed(() => getUiButtonProps({ ...buttonProps, prependIcon: icon }));
</script>

<template>
  <UiTooltip :label>
    <template #default="{ activatorProps }">
      <UiButtonLink
        v-if="to"
        :="mergeProps(activatorProps, uiButtonProps.attributes, $attrs)"
        :aria-label="label"
        :to
        :variant="uiButtonProps.variant"
        px-0
      >
        <span :class="uiButtonProps.icon" size-6 />
      </UiButtonLink>
      <UiButton
        v-else
        :="mergeProps(activatorProps, uiButtonProps.attributes, $attrs)"
        :aria-label="label"
        :disabled="uiButtonProps.isDisabled"
        :variant="uiButtonProps.variant"
        px-0
        @click="emit('click', $event)"
      >
        <UiSpinner v-if="uiButtonProps.isLoading" />
        <span v-else :class="uiButtonProps.icon" size-6 />
      </UiButton>
    </template>
    <template v-if="$slots.default" #content>
      <slot />
    </template>
  </UiTooltip>
</template>
