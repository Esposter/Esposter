<script setup lang="ts">
import type { SkinTone } from "@/models/message/emoji/SkinTone";

import { SkinTones } from "@/models/message/emoji/SkinTone";
import { applySkinTone } from "@/services/message/emoji/applySkinTone";
import { SKIN_TONE_PREVIEW_EMOJI_SLUG } from "@/services/message/emoji/constants";
import { getEmojiIndex } from "@/services/message/emoji/getEmojiIndex";

const modelValue = defineModel<SkinTone>({ required: true });
// One tone for every emoji that supports one, chosen once and persisted, rather than a per-emoji long-press
const skinToneEmoji = getEmojiIndex().slugEmojiMap.get(SKIN_TONE_PREVIEW_EMOJI_SLUG);
</script>

<template>
  <!-- `icon: true` rather than an icon name: the button draws the toned hand itself, and VBtn keeps its circular
       icon shape only while `icon` is set, which the activator slot would otherwise take away -->
  <StyledTooltipMenuIconButton
    v-if="skinToneEmoji"
    aria-label="Skin tone"
    :button-props="{ icon: true, size: 'small', variant: 'text' }"
    :menu-props="{ location: 'top' }"
    text="Skin tone"
  >
    <template #activator>
      <span lh-none text-title-medium>{{ applySkinTone(skinToneEmoji, modelValue) }}</span>
    </template>
    <v-list density="compact">
      <v-list-item
        v-for="skinTone of SkinTones"
        :key="skinTone"
        :active="skinTone === modelValue"
        @click.stop="modelValue = skinTone"
      >
        <span lh-none text-title-medium>{{ applySkinTone(skinToneEmoji, skinTone) }}</span>
      </v-list-item>
    </v-list>
  </StyledTooltipMenuIconButton>
</template>
