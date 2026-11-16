<script setup lang="ts">
import { MenuTextStyle } from "#src/assets/dungeons/scene/settings/styles/MenuTextStyle";
import {
  INITIAL_SETTINGS_POSITION,
  MENU_HEIGHT,
  MENU_VERTICAL_PADDING,
} from "#src/services/dungeons/scene/settings/constants";
import { useSettingsSceneStore } from "#src/store/dungeons/settings/scene";
import { omitUndefined } from "@esposter/shared";
import { Container, onCreate, Text } from "vue-phaserjs";

const settingsSceneStore = useSettingsSceneStore();
const { infoText } = storeToRefs(settingsSceneStore);
const width = useSettingsMenuWidth((menuWidth) => (wordWrapWidth.value = menuWidth - INITIAL_SETTINGS_POSITION.x * 2));
const height = ref<number>();
const wordWrapWidth = ref<number>();

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
        style: { ...MenuTextStyle, wordWrap: omitUndefined({ width: wordWrapWidth }) },
      }"
    />
  </Container>
</template>
