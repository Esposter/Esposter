<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
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
      visible: isInputPromptCursorVisible,
      x: inputPromptCursorX,
      texture: ImageKey.Cursor,
      angle: 90,
      scaleX: scale * 2,
      scaleY: scale * 1.5,
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
