<script setup lang="ts">
import Nineslice from "@/lib/phaser/components/Nineslice.vue";
import { GLASS_PANEL_CORNER_CUT_LENGTH } from "@/services/dungeons/constants";
import { MENU_HEIGHT } from "@/services/dungeons/settings/constants";
import { MenuColorImageKeyMap } from "@/services/dungeons/settings/MenuColorImageKeyMap";
import { useColorPickerStore } from "@/store/dungeons/settings/colorPicker";

const colorPickerStore = useColorPickerStore();
const { menuColor } = storeToRefs(colorPickerStore);
const width = useSettingsMenuWidth();
</script>

<template>
  <Nineslice
    :configuration="{
      width,
      height: MENU_HEIGHT,
      leftWidth: GLASS_PANEL_CORNER_CUT_LENGTH,
      rightWidth: GLASS_PANEL_CORNER_CUT_LENGTH,
      topHeight: GLASS_PANEL_CORNER_CUT_LENGTH,
      bottomHeight: GLASS_PANEL_CORNER_CUT_LENGTH,
      textureKey: MenuColorImageKeyMap[menuColor],
      origin: 0,
    }"
  />
</template>
