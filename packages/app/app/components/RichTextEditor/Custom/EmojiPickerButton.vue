<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";

import { EMOJI_PICKER_TOOLTIP_TEXT } from "@/services/styled/constants";

interface CustomEmojiPickerButtonProps {
  editor?: Editor;
}

const { editor } = defineProps<CustomEmojiPickerButtonProps>();
</script>

<template>
  <StyledEmojiPicker
    :tooltip-props="{ text: EMOJI_PICKER_TOOLTIP_TEXT }"
    :button-props="{ size: 'small' }"
    @select="editor?.chain().focus().insertContent($event).run()"
  />
</template>
