<script setup lang="ts">
import type { PickableEmoji } from "@/models/message/emoji/PickableEmoji";
import type { Editor } from "@tiptap/vue-3";

import { getPickableEmojiContent } from "@/services/message/emoji/getPickableEmojiContent";
import { useRoomEmojiStore } from "@/store/message/room/emoji";

interface CustomEmojiPickerButtonProps {
  editor?: Editor;
}

const { editor } = defineProps<CustomEmojiPickerButtonProps>();
// Empty wherever there is no room in scope — a post's comment editor gets the dataset alone
const roomEmojiStore = useRoomEmojiStore();
const { customEmojis } = storeToRefs(roomEmojiStore);
</script>

<template>
  <StyledEmojiPicker
    :button-props="{ size: 'small' }"
    :custom-emojis
    @select="
      (emojiTag: string, emoji: PickableEmoji) =>
        editor?.chain().focus().insertContent(getPickableEmojiContent(emoji, emojiTag)).run()
    "
  />
</template>
