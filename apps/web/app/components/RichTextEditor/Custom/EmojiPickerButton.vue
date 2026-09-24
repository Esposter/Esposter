<script setup lang="ts">
import type { PickableEmoji } from "@/models/message/emoji/PickableEmoji";
import type { Editor } from "@tiptap/vue-3";

import { getPickableEmojiContent } from "@/services/message/emoji/getPickableEmojiContent";

interface Props {
  editor?: Editor;
}

const { editor } = defineProps<Props>();
</script>

<template>
  <!-- The room's custom emoji are empty wherever there is no room in scope — a post's comment editor gets the dataset alone -->
  <MessageModelMessageEmojiPicker
    @select="
      (emojiTag: string, emoji: PickableEmoji) =>
        editor?.chain().focus().insertContent(getPickableEmojiContent(emoji, emojiTag)).run()
    "
  />
</template>
