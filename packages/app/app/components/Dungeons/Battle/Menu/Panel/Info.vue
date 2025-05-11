<script setup lang="ts">
import { DialogTextStyle } from "@/assets/dungeons/styles/DialogTextStyle";
import { ActivePanel } from "@/models/dungeons/scene/battle/menu/ActivePanel";
import { WORD_PADDING } from "@/services/dungeons/UI/constants";
import { useInfoPanelStore } from "@/store/dungeons/battle/infoPanel";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";
import { onCreate, Text } from "vue-phaserjs";

const battleSceneStore = useBattleSceneStore();
const { activePanel } = storeToRefs(battleSceneStore);
const infoPanelStore = useInfoPanelStore();
const { line1DialogMessage, line1TextDisplayWidth, line2Text } = storeToRefs(infoPanelStore);
const wordWrapWidth = ref<number>();

onCreate((scene) => {
  wordWrapWidth.value = scene.scale.width - WORD_PADDING;
});
</script>

<template>
  <template v-if="activePanel === ActivePanel.Info || activePanel === ActivePanel.Option">
    <Text
      :configuration="{
        x: 20,
        y: 468,
        // Display width is computed based on the set text, so we only require @update:display-width listener
        text: line1DialogMessage.text,
        style: { ...DialogTextStyle, wordWrap: { width: wordWrapWidth } },
      }"
      @update:display-width="(value) => (line1TextDisplayWidth = value)"
    />
    <Text
      :configuration="{
        x: 20,
        y: 512,
        text: line2Text,
        style: DialogTextStyle,
      }"
    />
    <DungeonsUIInputPromptCursor :y="480" />
  </template>
</template>
