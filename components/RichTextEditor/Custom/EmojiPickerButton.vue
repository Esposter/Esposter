<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";

interface CustomEmojiPickerButtonProps {
  editor?: Editor;
  tooltip: string;
}

const { editor, tooltip } = defineProps<CustomEmojiPickerButtonProps>();
</script>

<template>
  <StyledEmojiPicker
    :tooltip-props="{ text: tooltip }"
    :button-props="{ size: 'small' }"
    @select="(emoji) => editor?.chain().focus().insertContent(emoji).run()"
  />
</template>
