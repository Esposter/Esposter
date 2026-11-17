<script setup lang="ts">
import { MenuTextStyle } from "#src/assets/dungeons/scene/inventory/styles/MenuTextStyle";
import { PlayerSpecialInput } from "#src/models/dungeons/UI/input/PlayerSpecialInput";
import { WORD_PADDING } from "#src/services/dungeons/UI/constants";
import { useInventoryInfoPanelStore } from "#src/store/dungeons/inventory/infoPanel";
import { useInventorySceneStore } from "#src/store/dungeons/inventory/scene";
import { omitUndefined } from "@esposter/shared";
import { onCreate, Text } from "vue-phaserjs";

const inventoryInfoPanelStore = useInventoryInfoPanelStore();
const { infoDialogMessage } = storeToRefs(inventoryInfoPanelStore);
const inventorySceneStore = useInventorySceneStore();
const { itemOptionGrid } = inventorySceneStore;
const wordWrapWidth = ref<number>();

onCreate((scene) => {
  wordWrapWidth.value = scene.scale.width - WORD_PADDING;
});

watchImmediate(
  () => itemOptionGrid.value,
  (newItemOption) => {
    infoDialogMessage.value.text =
      newItemOption === PlayerSpecialInput.Cancel
        ? "Close your bag and go back to adventuring!"
        : newItemOption.description;
  },
);
</script>

<template>
  <Text
    :configuration="{
      x: 25,
      y: 420,
      text: infoDialogMessage.text,
      style: { ...MenuTextStyle, color: 'white', wordWrap: omitUndefined({ width: wordWrapWidth }) },
    }"
  />
</template>
