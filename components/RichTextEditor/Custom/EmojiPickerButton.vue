<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";

interface CustomEmojiPickerButtonProps {
  editor?: Editor;
  tooltip: string;
}

const props = defineProps<CustomEmojiPickerButtonProps>();
const { editor, tooltip } = toRefs(props);
</script>

<template>
  <EmojiPicker
    :tooltip-props="{ text: tooltip }"
    :button-props="{ size: 'small' }"
    @select="(emoji) => editor?.chain().focus().insertContent(emoji).run()"
  />
</template>
