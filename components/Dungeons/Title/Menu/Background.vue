<script setup lang="ts">
import Nineslice from "@/lib/phaser/components/Nineslice.vue";
import { GLASS_PANEL_CORNER_CUT_LENGTH } from "@/services/dungeons/constants";
import { MenuColorImageKeyMap } from "@/services/dungeons/settings/MenuColorImageKeyMap";
import { MENU_BACKGROUND_WIDTH } from "@/services/dungeons/title/menu/constants";
import { useColorPickerStore } from "@/store/dungeons/settings/colorPicker";

const colorPickerStore = useColorPickerStore();
const { menuColor } = storeToRefs(colorPickerStore);
</script>

<template>
  <Nineslice
    :configuration="{
      width: MENU_BACKGROUND_WIDTH,
      height: 180,
      leftWidth: GLASS_PANEL_CORNER_CUT_LENGTH,
      rightWidth: GLASS_PANEL_CORNER_CUT_LENGTH,
      topHeight: GLASS_PANEL_CORNER_CUT_LENGTH,
      bottomHeight: GLASS_PANEL_CORNER_CUT_LENGTH,
      textureKey: MenuColorImageKeyMap[menuColor],
      origin: 0,
    }"
  />
</template>
