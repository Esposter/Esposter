<script setup lang="ts">
import type { PickableEmoji } from "@/models/message/emoji/PickableEmoji";
import type { SkinTone } from "@/models/message/emoji/SkinTone";

import { getEmojiShortcode } from "@/services/message/emoji/getEmojiShortcode";

interface StyledEmojiPickerFooterProps {
  emoji?: PickableEmoji;
}

const skinTone = defineModel<SkinTone>("skinTone", { required: true });
const { emoji } = defineProps<StyledEmojiPickerFooterProps>();
</script>

<template>
  <div px-2 flex gap-2 h-10 items-center>
    <template v-if="emoji">
      <span leading-none text-title-large><StyledEmoji :emoji :skin-tone /></span>
      <span font-semibold text-body-small>{{ getEmojiShortcode(emoji.slug) }}</span>
    </template>
    <v-spacer />
    <StyledEmojiPickerSkinToneMenu v-model="skinTone" />
  </div>
</template>
