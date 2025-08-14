<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/scene/inventory/styles/MenuTextStyle";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { WORD_PADDING } from "@/services/dungeons/UI/constants";
import { useInfoPanelStore } from "@/store/dungeons/inventory/infoPanel";
import { onCreate, Text } from "vue-phaserjs";

const infoPanelStore = useInfoPanelStore();
const { infoDialogMessage } = storeToRefs(infoPanelStore);
const itemOptionGrid = useItemOptionGrid();
const wordWrapWidth = ref<number>();

onCreate((scene) => {
  wordWrapWidth.value = scene.scale.width - WORD_PADDING;
});

watchImmediate(
  () => itemOptionGrid.value,
  (newValue) => {
    infoDialogMessage.value.text =
      newValue === PlayerSpecialInput.Cancel ? "Close your bag and go back to adventuring!" : newValue.description;
  },
);
</script>

<template>
  <Text
    :configuration="{
      x: 25,
      y: 420,
      text: infoDialogMessage.text,
      style: { ...MenuTextStyle, color: 'white', wordWrap: { width: wordWrapWidth } },
    }"
  />
</template>
