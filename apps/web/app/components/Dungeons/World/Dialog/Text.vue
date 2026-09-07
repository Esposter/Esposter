<script setup lang="ts">
import type { DialogMessage } from "@/models/dungeons/UI/dialog/DialogMessage";

import { DialogTextStyle } from "@/assets/dungeons/styles/DialogTextStyle";
import { DIALOG_WIDTH } from "@/services/dungeons/scene/world/constants";
import { WORD_PADDING } from "@/services/dungeons/UI/constants";
import { Text } from "vue-phaserjs";

interface Props {
  dialogMessage: DialogMessage;
}

const { dialogMessage } = defineProps<Props>();
// A titled message stacks its title above the text, one line height apart
const lines = computed(() => (dialogMessage.title ? [dialogMessage.title, dialogMessage.text] : [dialogMessage.text]));
</script>

<template>
  <Text
    v-for="(line, index) of lines"
    :key="index"
    :configuration="{
      x: 18,
      y: 12 + DialogTextStyle.fontSize * index,
      text: line,
      style: {
        ...DialogTextStyle,
        wordWrap: { width: DIALOG_WIDTH - WORD_PADDING },
      },
    }"
  />
</template>
