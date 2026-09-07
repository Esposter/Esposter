<script setup lang="ts">
import { FileKey } from "#shared/generated/phaser/FileKey";
import { getTweenRange } from "@/services/dungeons/animation/getTweenRange";
import { useDialogStore } from "@/store/dungeons/dialog";
import { Image } from "vue-phaserjs";

interface Props {
  scale?: number;
  y: number;
}

const { scale = 1, y } = defineProps<Props>();
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
        duration: 500,
        repeat: -1,
        y: getTweenRange(y, y + 6),
      },
    }"
    @update:display-width="inputPromptCursorDisplayWidth = $event"
  />
</template>
