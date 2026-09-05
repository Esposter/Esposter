<script setup lang="ts">
import type { PickableEmoji } from "@/models/message/emoji/PickableEmoji";
import type { SkinTone } from "@/models/message/emoji/SkinTone";

import { EmojiType } from "@/models/message/emoji/EmojiType";
import { applySkinTone } from "@/services/message/emoji/applySkinTone";

interface Props {
  emoji: PickableEmoji;
  skinTone: SkinTone;
}

const { emoji, skinTone } = defineProps<Props>();
</script>

<template>
  <!-- The one place a glyph is rendered, so no surface has to know which vocabulary it was handed. The image is
       sized in `em` so it follows whatever text size its container states, exactly as the character does -->
  <NuxtImg
    v-if="emoji.type === EmojiType.Custom"
    :alt="emoji.name"
    :src="emoji.sasUrl"
    size="[1em]"
    inline-block
    object-contain
  />
  <span v-else leading-none>{{ applySkinTone(emoji, skinTone) }}</span>
</template>
