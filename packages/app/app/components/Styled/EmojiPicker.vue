<script setup lang="ts">
import type { VBtn, VTooltip } from "vuetify/components";

import data from "emoji-mart-vue-fast/data/all.json";
// @ts-expect-error @TODO: https://github.com/serebrov/emoji-mart-vue/issues/121
import Picker from "emoji-mart-vue-fast/src/components/Picker.vue";
// @ts-expect-error @TODO: https://github.com/serebrov/emoji-mart-vue/issues/121
import { EmojiIndex } from "emoji-mart-vue-fast/src/utils/emoji-data";
import { mergeProps } from "vue";

interface StyledEmojiPickerProps {
  buttonAttrs?: VBtn["$attrs"];
  buttonProps?: VBtn["$props"];
  tooltipProps?: VTooltip["$props"];
}

defineSlots<{ default?: (props: Record<string, unknown>) => unknown }>();
const { buttonAttrs = {}, buttonProps = {}, tooltipProps = {} } = defineProps<StyledEmojiPickerProps>();
const emit = defineEmits<{ select: [emoji: string]; "update:menu": [value: boolean] }>();
const emojiIndex = new EmojiIndex(data);
const menu = ref(false);
const onSelectEmoji = (emoji: { native: string }) => {
  emit("select", emoji.native);
  emit("update:menu", false);
  menu.value = false;
};
</script>

<template>
  <v-menu
    transition="none"
    location="left"
    :close-on-content-click="false"
    :model-value="menu"
    @update:model-value="
      (value) => {
        emit('update:menu', value);
        menu = value;
      }
    "
  >
    <template #activator="{ props: menuProps }">
      <slot :="menuProps">
        <v-tooltip :="tooltipProps">
          <template #activator="{ props: tooltipActivatorProps }">
            <v-btn icon="mdi-emoticon" :="mergeProps(menuProps, tooltipActivatorProps, buttonProps, buttonAttrs)" />
          </template>
        </v-tooltip>
      </slot>
    </template>
    <Picker :data="emojiIndex" @select="onSelectEmoji" />
  </v-menu>
</template>

<style lang="scss">
@use "emoji-mart-vue-fast/css/emoji-mart.css";
</style>
