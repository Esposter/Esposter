<script setup lang="ts">
import { ImageKey } from "#shared/models/dungeons/keys/image/ImageKey";
import { getTweenRange } from "@/services/dungeons/animation/getTweenRange";
import { useDialogStore } from "@/store/dungeons/dialog";
import { SECOND } from "@esposter/shared";
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
      texture: ImageKey.Cursor,
      angle: 90,
      scaleX: scale * 2,
      scaleY: scale * 1.5,
      displayWidth: inputPromptCursorDisplayWidth,
      tween: {
        delay: 0,
        duration: 0.5 * SECOND,
        repeat: -1,
        y: getTweenRange(y, y + 6),
      },
    }"
    @update:display-width="inputPromptCursorDisplayWidth = $event"
  />
</template>
