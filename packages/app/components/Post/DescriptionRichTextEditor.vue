<script setup lang="ts">
import type { FooterBarAppendSlotProps } from "@/components/RichTextEditor/FooterBar.vue";

import { POST_DESCRIPTION_MAX_LENGTH } from "@/services/post/constants";

export interface DescriptionRichTextEditorProps {
  placeholder?: string;
}

const modelValue = defineModel<string>({ required: true });
const { placeholder } = defineProps<DescriptionRichTextEditorProps>();
const slots = defineSlots<{
  "append-footer": (props: FooterBarAppendSlotProps) => unknown;
}>();
</script>

<template>
  <RichTextEditor
    v-model="modelValue"
    :placeholder="placeholder ?? 'Text (optional)'"
    :limit="POST_DESCRIPTION_MAX_LENGTH"
  >
    <template #prepend-footer="{ editor }">
      <RichTextEditorCustomEmojiPickerButton :editor="editor" tooltip="Select an emoji" />
    </template>
    <template #append-footer="{ editor }">
      <slot name="append-footer" :editor="editor" />
    </template>
  </RichTextEditor>
</template>
