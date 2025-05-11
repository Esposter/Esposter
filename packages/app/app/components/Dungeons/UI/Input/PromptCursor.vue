<script setup lang="ts">
import { FileKey } from "#shared/generated/phaser/FileKey";
import { dayjs } from "#shared/services/dayjs";
import { useDialogStore } from "@/store/dungeons/dialog";
import { Image } from "vue-phaserjs";

interface InputPromptCursorProps {
  scale?: number;
  y: number;
}

const { scale = 1, y } = defineProps<InputPromptCursorProps>();
const dialogStore = useDialogStore();
const { inputPromptCursorDisplayWidth, inputPromptCursorX, isInputPromptCursorVisible } = storeToRefs(dialogStore);
</script>

<template>
  <Image
    :configuration="{
      visible: isInputPromptCursorVisible,
      x: inputPromptCursorX,
      texture: FileKey.UICursorCursor,
      angle: 90,
      scaleX: scale * 2,
      scaleY: scale * 1.5,
      displayWidth: inputPromptCursorDisplayWidth,
      tween: {
        delay: 0,
        duration: dayjs.duration(0.5, 'seconds').asMilliseconds(),
        repeat: -1,
        y: {
          from: y,
          start: y,
          to: y + 6,
        },
      },
    }"
    @update:display-width="(value) => (inputPromptCursorDisplayWidth = value)"
  />
</template>
