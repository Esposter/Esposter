<script setup lang="ts" generic="T extends string">
import Image from "@/lib/phaser/components/Image.vue";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { dayjs } from "@/services/dayjs";
import { useDialogStore } from "@/store/dungeons/dialog";

interface InputPromptCursorProps {
  height: number;
  scale?: number;
}

const { height, scale = 1 } = defineProps<InputPromptCursorProps>();
const dialogStore = useDialogStore();
const { inputPromptCursorX, inputPromptCursorDisplayWidth, isInputPromptCursorVisible } = storeToRefs(dialogStore);
</script>

<template>
  <Image
    :configuration="{
      x: inputPromptCursorX,
      textureKey: ImageKey.Cursor,
      visible: isInputPromptCursorVisible,
      angle: 90,
      scaleX: 2 * scale,
      scaleY: 1.5 * scale,
      displayWidth: inputPromptCursorDisplayWidth,
      tween: {
        delay: 0,
        duration: dayjs.duration(0.5, 'seconds').asMilliseconds(),
        repeat: -1,
        y: {
          from: height,
          start: height,
          to: height + 6,
        },
      },
    }"
    @update:display-width="(value: typeof inputPromptCursorDisplayWidth) => (inputPromptCursorDisplayWidth = value)"
  />
</template>
