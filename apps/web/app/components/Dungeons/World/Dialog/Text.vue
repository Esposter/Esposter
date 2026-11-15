<script setup lang="ts">
import type { DialogMessage } from "#src/models/dungeons/UI/dialog/DialogMessage";

import { DialogTextStyle } from "#src/assets/dungeons/styles/DialogTextStyle";
import { DIALOG_WIDTH } from "#src/services/dungeons/scene/world/constants";
import { WORD_PADDING } from "#src/services/dungeons/UI/constants";
import { Text } from "vue-phaserjs";

interface Props {
  dialogMessage: DialogMessage;
}

defineProps<Props>();
</script>

<template>
  <!-- A titled message stacks its title above the text, one line height apart -->
  <Text
    v-for="(line, index) of dialogMessage.title ? [dialogMessage.title, dialogMessage.text] : [dialogMessage.text]"
    :key="index"
    :configuration="{
      x: 18,
      y: 12 + DialogTextStyle.fontSize * index,
      text: line,
      style: { ...DialogTextStyle, wordWrap: { width: DIALOG_WIDTH - WORD_PADDING } },
    }"
  />
</template>
