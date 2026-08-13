<script setup lang="ts">
import type { VBtn, VTooltip } from "vuetify/components";

import { emojiIndex } from "@/services/message/emoji/emojiIndex";
// @ts-expect-error @TODO: https://github.com/serebrov/emoji-mart-vue/issues/121
import Picker from "emoji-mart-vue-fast/src/components/Picker.vue";
import "emoji-mart-vue-fast/css/emoji-mart.css";
import { mergeProps } from "vue";
// @TODO: https://github.com/vuejs/core/issues/11371
interface StyledEmojiPickerProps {
  buttonProps?: VBtn["$props"];
  tooltipProps?: VTooltip["$props"];
}

defineSlots<{ default?: (props: Record<string, unknown>) => VNode }>();
const menu = defineModel<boolean>("menu", { default: false });
const { buttonProps = {}, tooltipProps = {} } = defineProps<StyledEmojiPickerProps>();
const emit = defineEmits<{ select: [emoji: string] }>();
</script>

<template>
  <v-menu v-model="menu" transition="none" location="left" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <slot :="menuProps">
        <v-tooltip :="tooltipProps">
          <template #activator="{ props: tooltipActivatorProps }">
            <v-btn icon="mdi-emoticon" :="mergeProps(menuProps, tooltipActivatorProps, buttonProps)" />
          </template>
        </v-tooltip>
      </slot>
    </template>
    <Picker
      :data="emojiIndex"
      @select="
        (emoji: { native: string }) => {
          emit('select', emoji.native);
          menu = false;
        }
      "
    />
  </v-menu>
</template>
