<script setup lang="ts">
import type { Emoji } from "@/models/message/emoji/Emoji";
import type { SkinTone } from "@/models/message/emoji/SkinTone";

import { applySkinTone } from "@/services/message/emoji/applySkinTone";
import { getEmojiDescription } from "@/services/message/emoji/getEmojiDescription";

interface StyledEmojiPickerFooterProps {
  emoji?: Emoji;
}

const skinTone = defineModel<SkinTone>("skinTone", { required: true });
const { emoji } = defineProps<StyledEmojiPickerFooterProps>();
</script>

<template>
  <div px-2 flex gap-2 h-10 items-center>
    <template v-if="emoji">
      <span leading-none text-title-large>{{ applySkinTone(emoji, skinTone) }}</span>
      <span font-semibold text-body-small>{{ getEmojiDescription(emoji.character) }}</span>
    </template>
    <v-spacer />
    <StyledEmojiPickerSkinToneMenu v-model="skinTone" />
  </div>
</template>
