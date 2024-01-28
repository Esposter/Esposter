<script setup lang="ts" generic="T extends string">
import Image from "@/lib/phaser/components/Image.vue";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { dayjs } from "@/services/dayjs";
import { INITIAL_PLAYER_INPUT_PROMPT_CURSOR_POSITION } from "@/services/dungeons/battle/UI/menu/constants";
import { usePlayerStore } from "~/store/dungeons/scene/battle/player";

interface PlayerInputPromptCursorProps {
  isVisible: boolean;
}

const { isVisible } = defineProps<PlayerInputPromptCursorProps>();
const playerStore = usePlayerStore();
const { inputPromptCursorPositionX, inputPromptCursorDisplayWidth } = storeToRefs(playerStore);
</script>

<template>
  <Image
    :configuration="{
      x: inputPromptCursorPositionX,
      textureKey: TextureManagerKey.Cursor,
      visible: isVisible,
      angle: 90,
      scaleX: 2.5,
      scaleY: 1.25,
      displayWidth: inputPromptCursorDisplayWidth,
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
    @update:display-width="(value: typeof inputPromptCursorDisplayWidth) => (inputPromptCursorDisplayWidth = value)"
  />
</template>
