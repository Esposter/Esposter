<script setup lang="ts">
import type { CustomEmoji } from "@/models/message/emoji/CustomEmoji";
import type { PickableEmoji } from "@/models/message/emoji/PickableEmoji";
import type { VBtn, VTooltip } from "vuetify/components";

import { EMOJI_PICKER_TOOLTIP_TEXT } from "@/services/styled/constants";
import { mergeProps } from "vue";
import { VBottomSheet, VMenu } from "vuetify/components";
// @TODO: https://github.com/vuejs/core/issues/11371
interface Props {
  buttonProps?: VBtn["$props"];
  customEmojis?: CustomEmoji[];
  tooltipProps?: VTooltip["$props"];
}

defineSlots<{ default?: (props: Record<string, unknown>) => VNode; footer?: () => VNode }>();
const menu = defineModel<boolean>("menu", { default: false });
const {
  buttonProps = {},
  customEmojis = [],
  tooltipProps = { text: EMOJI_PICKER_TOOLTIP_TEXT },
} = defineProps<Props>();
const emit = defineEmits<{ select: [emojiTag: string, emoji: PickableEmoji] }>();
// A phone has no room beside the composer for a panel this size, and a menu anchored to a button near the screen
// Edge is dragged back into the viewport wherever it fits. It comes up off the bottom edge instead — the same
// Panel, in whichever container the viewport can hold, each keeping its own form's transition
const { smAndDown } = useVDisplay();
// The width is stated because a bottom sheet is a dialog underneath, so it would otherwise inherit the 500 the
// App's VDialog default sets and sit centred at the bottom edge rather than spanning it. The component itself is
// Kept out of the spread: `is` only selects a dynamic component when it is on the element, never via v-bind
const overlay = computed(() =>
  smAndDown.value
    ? ({ is: VBottomSheet, props: { width: "100%" } } as const)
    : ({ is: VMenu, props: { location: "left", transition: "none" } } as const),
);
</script>

<template>
  <component :is="overlay.is" v-model="menu" :="overlay.props" :close-on-content-click="false">
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
      :custom-emojis
      @select="
        (emojiTag: string, emoji: PickableEmoji) => {
          emit('select', emojiTag, emoji);
          menu = false;
        }
      "
    >
      <template #footer>
        <slot name="footer" />
      </template>
    </StyledEmojiPickerPanel>
  </component>
</template>
