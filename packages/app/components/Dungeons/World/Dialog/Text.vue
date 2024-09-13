<script setup lang="ts">
import type { DialogMessage } from "@/models/dungeons/UI/dialog/DialogMessage";

import { DialogTextStyle } from "@/assets/dungeons/styles/DialogTextStyle";
import { DIALOG_WIDTH } from "@/services/dungeons/scene/world/constants";
import { WORD_PADDING } from "@/services/dungeons/UI/constants";
import { Text } from "vue-phaserjs";

interface DialogTextProps {
  dialogMessage: DialogMessage;
}

const { dialogMessage } = defineProps<DialogTextProps>();
const x = 18;
const y = 12;
</script>

<template>
  <template v-if="dialogMessage.title">
    <Text
      :configuration="{
        x,
        y,
        text: dialogMessage.title,
        style: {
          ...DialogTextStyle,
          wordWrap: { width: DIALOG_WIDTH - WORD_PADDING },
        },
      }"
    />
    <Text
      :configuration="{
        x,
        y: y + DialogTextStyle.fontSize,
        text: dialogMessage.text,
        style: {
          ...DialogTextStyle,
          wordWrap: { width: DIALOG_WIDTH - WORD_PADDING },
        },
      }"
    />
  </template>
  <Text
    v-else
    :configuration="{
      x,
      y,
      text: dialogMessage.text,
      style: {
        ...DialogTextStyle,
        wordWrap: { width: DIALOG_WIDTH - x },
      },
    }"
  />
</template>
