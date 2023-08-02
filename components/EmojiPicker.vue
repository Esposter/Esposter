<script setup lang="ts">
import data from "emoji-mart-vue-fast/data/all.json";
// @ts-expect-error
import { EmojiIndex } from "emoji-mart-vue-fast/src/utils/emoji-data";
import { mergeProps } from "vue";
import type { VBtn, VTooltip } from "vuetify/components";

interface EmojiPickerProps {
  tooltipProps: VTooltip["$props"];
  buttonProps?: VBtn["$props"];
  buttonAttrs?: VBtn["$attrs"];
}

const props = defineProps<EmojiPickerProps>();
const { tooltipProps, buttonProps, buttonAttrs } = toRefs(props);
const emit = defineEmits<{
  "update:menu": [value: boolean];
  select: [emoji: string];
}>();
const emojiIndex = new EmojiIndex(data);
const menu = ref(false);
const onEmojiSelect = (emoji: { native: string }) => {
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
      <v-tooltip :="tooltipProps">
        <template #activator="{ props: tooltipActivatorProps }">
          <v-btn
            icon="mdi-emoticon"
            :="mergeProps(menuProps, tooltipActivatorProps, buttonProps ?? {}, buttonAttrs ?? {})"
          />
        </template>
      </v-tooltip>
    </template>
    <v-emoji-picker :data="emojiIndex" @select="onEmojiSelect" />
  </v-menu>
</template>
