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
  <v-menu v-if="skinToneEmoji" location="top">
    <template #activator="{ props }">
      <v-btn aria-label="Skin tone" :="props" size="small" variant="text" icon>
        <span leading-none text-title-medium>{{ applySkinTone(skinToneEmoji, modelValue) }}</span>
        <v-tooltip activator="parent" location="top" text="Skin tone" />
      </v-btn>
    </template>
    <v-list density="compact">
      <v-list-item
        v-for="skinTone of SkinTones"
        :key="skinTone"
        :active="skinTone === modelValue"
        @click.stop="modelValue = skinTone"
      >
        <span leading-none text-title-medium>{{ applySkinTone(skinToneEmoji, skinTone) }}</span>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
