<script setup lang="ts">
import type { PickableEmoji } from "#src/models/message/emoji/PickableEmoji";
import type { SkinTone } from "#src/models/message/emoji/SkinTone";

import { EmojiType } from "#src/models/message/emoji/EmojiType";
import { applySkinTone } from "#src/services/message/emoji/applySkinTone";

interface Props {
  emoji: PickableEmoji;
  skinTone: SkinTone;
}

defineProps<Props>();
</script>

<template>
  <!-- The one place a glyph is rendered, so no surface has to know which vocabulary it was handed. The image is
       sized in `em` so it follows whatever text size its container states, exactly as the character does -->
  <NuxtImg
    v-if="emoji.type === EmojiType.Custom"
    :alt="emoji.name"
    :src="emoji.presignedUrl"
    size="[1em]"
    inline-block
    object-contain
  />
  <span v-else lh-none>{{ applySkinTone(emoji, skinTone) }}</span>
</template>
