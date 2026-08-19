<script setup lang="ts">
import type { VBtn, VTooltip } from "vuetify/components";

import { EMOJI_PICKER_TOOLTIP_TEXT } from "@/services/styled/constants";
import { mergeProps } from "vue";
import { VBottomSheet, VMenu } from "vuetify/components";
// @TODO: https://github.com/vuejs/core/issues/11371
interface StyledEmojiPickerProps {
  buttonProps?: VBtn["$props"];
  tooltipProps?: VTooltip["$props"];
}

defineSlots<{ default?: (props: Record<string, unknown>) => VNode }>();
const menu = defineModel<boolean>("menu", { default: false });
const { buttonProps = {}, tooltipProps = { text: EMOJI_PICKER_TOOLTIP_TEXT } } = defineProps<StyledEmojiPickerProps>();
const emit = defineEmits<{ select: [emoji: string] }>();
// A phone has no room beside the composer for a panel this size, and a menu anchored to a button near the screen
// Edge is dragged back into the viewport wherever it fits. It comes up off the bottom edge instead — the same
// Panel, in whichever container the viewport can hold, each keeping its own form's transition
const { smAndDown } = useVDisplay();
// The width is stated because a bottom sheet is a dialog underneath, so it would otherwise inherit the 500 the
// App's VDialog default sets and sit centred at the bottom edge rather than spanning it
const overlay = computed(() =>
  smAndDown.value ? { is: VBottomSheet, width: "100%" } : { is: VMenu, location: "left", transition: "none" },
);
</script>

<template>
  <component v-model="menu" :="overlay" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <slot :="menuProps">
        <v-tooltip :="tooltipProps">
          <template #activator="{ props: tooltipActivatorProps }">
            <!-- The tooltip names the icon-only button visually only, so the same text is its accessible name -->
            <v-btn
              icon="mdi-emoticon"
              :aria-label="tooltipProps.text"
              :="mergeProps(menuProps, tooltipActivatorProps, buttonProps)"
            />
          </template>
        </v-tooltip>
      </slot>
    </template>
    <!-- The overlay renders its content only once opened, which is what defers the index build to first open -->
    <StyledEmojiPickerPanel
      @select="
        (emoji: string) => {
          emit('select', emoji);
          menu = false;
        }
      "
    />
  </component>
</template>
