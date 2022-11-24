<script setup lang="ts">
import data from "emoji-mart-vue-fast/data/all.json";
// @ts-ignore
import { EmojiIndex } from "emoji-mart-vue-fast/src/utils/emoji-data";
import { mergeProps } from "vue";
import { VBtn, VTooltip } from "vuetify/components";

interface EmojiPickerProps {
  tooltipProps: InstanceType<typeof VTooltip>["$props"];
  buttonProps?: InstanceType<typeof VBtn>["$props"];
  buttonAttrs?: InstanceType<typeof VBtn>["$attrs"];
}

const props = defineProps<EmojiPickerProps>();
const { tooltipProps, buttonProps, buttonAttrs } = $(toRefs(props));
const emit = defineEmits<{
  (event: "update:model-value", value: boolean): void;
  (event: "select", emoji: string): void;
}>();
const emojiIndex = new EmojiIndex(data);
const onEmojiSelect = (emoji: { native: string }) => emit("select", emoji.native);
</script>

<template>
  <v-menu
    transition="none"
    location="left"
    :close-on-content-click="false"
    @update:model-value="(value) => emit('update:model-value', value)"
  >
    <template #activator="{ props: menuProps }">
      <v-tooltip location="top" :="tooltipProps">
        <template #activator="{ props: tooltipPropsActivator }">
          <v-btn
            bg="transparent!"
            icon="mdi-emoticon"
            flat
            :="mergeProps(menuProps, tooltipPropsActivator, buttonProps ?? {}, buttonAttrs ?? {})"
          />
        </template>
      </v-tooltip>
    </template>
    <v-emoji-picker :data="emojiIndex" @select="onEmojiSelect" />
  </v-menu>
</template>
