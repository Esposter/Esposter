<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/scene/settings/styles/MenuTextStyle";
import Container from "@/lib/phaser/components/Container.vue";
import Text from "@/lib/phaser/components/Text.vue";
import {
  INITIAL_SETTINGS_POSITION,
  MENU_HEIGHT,
  MENU_VERTICAL_PADDING,
} from "@/services/dungeons/scene/settings/constants";
import { useSettingsSceneStore } from "@/store/dungeons/settings/scene";
import { onCreate } from "~/lib/phaser/hooks/onCreate";

const settingsSceneStore = useSettingsSceneStore();
const { infoText } = storeToRefs(settingsSceneStore);
const width = useSettingsMenuWidth();
const height = ref<number>();

onCreate((scene) => {
  height.value = scene.scale.height - (MENU_HEIGHT + MENU_VERTICAL_PADDING * 3);
});
</script>

<template>
  <Container :configuration="{ y: MENU_HEIGHT + MENU_VERTICAL_PADDING }">
    <DungeonsUIGlassPanelNineSlice :width :height />
    <Text
      :configuration="{
        x: INITIAL_SETTINGS_POSITION.x,
        y: 8,
        text: infoText,
        style: { ...MenuTextStyle, wordWrap: { width: width - INITIAL_SETTINGS_POSITION.x * 2 } },
      }"
    />
  </Container>
</template>
