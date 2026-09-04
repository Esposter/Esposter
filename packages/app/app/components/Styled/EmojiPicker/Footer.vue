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

<!-- A bar tinted against the panel's own surface the way the app bar is: the picker's background token is one step
     off `surface`, so the footer separates itself in both themes without a colour of its own. It holds one thing at
     a time, Slack's shape — the hovered emoji takes the whole bar and the standing controls take it back the moment
     the pointer leaves the grid. The bar states its own height, so which of the two is showing never moves anything
     around it -->
<template>
  <div h="[var(--app-bar-height)]" px-3 bg-background flex gap-3 items-center>
    <template v-if="emoji">
      <span leading-none text-headline-small><StyledEmoji :emoji :skin-tone /></span>
      <span font-semibold truncate text-body-medium>{{ getEmojiShortcode(emoji.slug) }}</span>
    </template>
    <template v-else>
      <slot />
      <v-spacer />
      <!-- Icon-only where Slack labels it: the panel is a third of the width of Slack's, and a label would come out
       of the room the actions beside it need. The hand already carries the current tone, which is the whole of
       what it reports -->
      <StyledEmojiPickerSkinToneMenu v-model="skinTone" />
    </template>
  </div>
</template>
