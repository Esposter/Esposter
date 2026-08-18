<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";

interface CustomEmojiPickerButtonProps {
  editor?: Editor;
}

const { editor } = defineProps<CustomEmojiPickerButtonProps>();
</script>

<template>
  <StyledEmojiPicker :button-props="{ size: 'small' }" @select="editor?.chain().focus().insertContent($event).run()" />
</template>
