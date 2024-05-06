<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/scene/inventory/styles/MenuTextStyle";
import Text from "@/lib/phaser/components/Text.vue";
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { WORD_PADDING } from "@/services/dungeons/UI/constants";
import { useInventorySceneStore } from "@/store/dungeons/inventory/scene";

const inventorySceneStore = useInventorySceneStore();
const { itemOptionGrid } = storeToRefs(inventorySceneStore);
const text = computed(() =>
  itemOptionGrid.value.value === PlayerSpecialInput.Cancel
    ? "Close your bag and go back to adventuring!"
    : itemOptionGrid.value.value.description,
);
const wordWrapWidth = ref<number>();

onCreate((scene) => {
  wordWrapWidth.value = scene.scale.width - WORD_PADDING;
});
</script>

<template>
  <Text
    :configuration="{
      x: 25,
      y: 420,
      text,
      style: { ...MenuTextStyle, color: 'white', wordWrap: { width: wordWrapWidth } },
    }"
  />
</template>
