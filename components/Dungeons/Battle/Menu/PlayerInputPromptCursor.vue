<script setup lang="ts" generic="T extends string">
import Image from "@/lib/phaser/components/Image.vue";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { dayjs } from "@/services/dayjs";
import { INITIAL_PLAYER_INPUT_PROMPT_CURSOR_POSITION } from "@/services/dungeons/battle/UI/menu/constants";

interface PlayerInputPromptCursorProps {
  isVisible: boolean;
}

const { isVisible } = defineProps<PlayerInputPromptCursorProps>();
</script>

<template>
  <Image
    :configuration="{
      textureKey: TextureManagerKey.Cursor,
      visible: isVisible,
      tween: {
        delay: 0,
        duration: dayjs.duration(0.5, 'seconds').asMilliseconds(),
        repeat: -1,
        y: {
          from: INITIAL_PLAYER_INPUT_PROMPT_CURSOR_POSITION.y,
          start: INITIAL_PLAYER_INPUT_PROMPT_CURSOR_POSITION.y,
          to: INITIAL_PLAYER_INPUT_PROMPT_CURSOR_POSITION.y + 6,
        },
      },
    }"
  />
</template>
