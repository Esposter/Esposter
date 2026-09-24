<script setup lang="ts">
import type { PickableEmoji } from "@/models/message/emoji/PickableEmoji";
import type { SkinTone } from "@/models/message/emoji/SkinTone";

import { getEmojiShortcode } from "@/services/message/emoji/getEmojiShortcode";

interface Props {
  emoji?: PickableEmoji;
}

defineSlots<{ default?: () => VNode }>();
const skinTone = defineModel<SkinTone>("skinTone", { required: true });
const { emoji } = defineProps<Props>();
</script>

<!-- One thing at a time, Slack's shape: the hovered emoji takes the whole bar and the standing controls take it back the
     moment the pointer leaves the grid. The bar states its own height, so which of the two is showing never moves
     anything around it -->
<template>
  <div flex gap-2 h-10 items-center>
    <template v-if="emoji">
      <span ui-title><StyledEmoji :emoji :skin-tone /></span>
      <span truncate>{{ getEmojiShortcode(emoji.slug) }}</span>
    </template>
    <template v-else>
      <slot />
      <div flex-1 />
      <!-- Icon-only where Slack labels it: the panel is a third of the width of Slack's, and a label would come out of
        The room the actions beside it need. The hand already carries the current tone, which is all it reports -->
      <StyledEmojiPickerSkinToneMenu v-model="skinTone" />
    </template>
  </div>
</template>
