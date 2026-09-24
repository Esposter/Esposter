<script setup lang="ts">
import { SkinTone } from "@/models/message/emoji/SkinTone";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { applySkinTone } from "@/services/message/emoji/applySkinTone";
import { SKIN_TONE_PREVIEW_EMOJI_SLUG } from "@/services/message/emoji/constants";
import { getEmojiIndex } from "@/services/message/emoji/getEmojiIndex";

const modelValue = defineModel<SkinTone>({ required: true });
// One tone for every emoji that supports one, chosen once and persisted, rather than a per-emoji long-press
const skinToneEmoji = getEmojiIndex().slugEmojiMap.get(SKIN_TONE_PREVIEW_EMOJI_SLUG);
// Keyed by the tone's name, since the untoned default's modifier is the empty string
const skinToneItems = computed(() =>
  skinToneEmoji
    ? Object.entries(SkinTone).map(([name, skinTone]) => ({
        description: name,
        title: applySkinTone(skinToneEmoji, skinTone),
        value: name,
      }))
    : [],
);
</script>

<template>
  <UiMenu
    v-if="skinToneEmoji"
    :items="skinToneItems"
    label="Skin tone"
    position-area="top span-left"
    :variant="UiButtonVariant.Quiet"
    px-0
    @select="
      (name) => {
        const skinTone = Object.entries(SkinTone).find(([skinToneName]) => skinToneName === name)?.[1];
        if (skinTone !== undefined) modelValue = skinTone;
      }
    "
  >
    <span ui-title>{{ applySkinTone(skinToneEmoji, modelValue) }}</span>
  </UiMenu>
</template>
