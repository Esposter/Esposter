<script setup lang="ts">
import type { VBtn, VTooltip } from "vuetify/components";

import { EMOJI_PICKER_TOOLTIP_TEXT } from "@/services/styled/constants";
import { mergeProps } from "vue";
// @TODO: https://github.com/vuejs/core/issues/11371
interface StyledEmojiPickerProps {
  buttonProps?: VBtn["$props"];
  tooltipProps?: VTooltip["$props"];
}

defineSlots<{ default?: (props: Record<string, unknown>) => VNode }>();
const menu = defineModel<boolean>("menu", { default: false });
const { buttonProps = {}, tooltipProps = { text: EMOJI_PICKER_TOOLTIP_TEXT } } = defineProps<StyledEmojiPickerProps>();
const emit = defineEmits<{ select: [emoji: string] }>();
</script>

<template>
  <v-menu v-model="menu" :close-on-content-click="false" location="left" transition="none">
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
  </v-menu>
</template>
