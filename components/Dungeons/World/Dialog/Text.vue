<script setup lang="ts">
import { DialogTextStyle } from "@/assets/dungeons/styles/DialogTextStyle";
import Text from "@/lib/phaser/components/Text.vue";
import type { DialogMessage } from "@/models/dungeons/UI/dialog/DialogMessage";
import { DIALOG_WIDTH } from "@/services/dungeons/world/constants";

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
          wordWrap: { width: DIALOG_WIDTH - x },
        },
      }"
    />
    <Text
      :configuration="{
        x,
        y: y + Number(DialogTextStyle.fontSize ?? 0),
        text: dialogMessage.text,
        style: {
          ...DialogTextStyle,
          wordWrap: { width: DIALOG_WIDTH - x },
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
