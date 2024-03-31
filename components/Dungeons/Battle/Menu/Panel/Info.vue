<script setup lang="ts">
import { DialogTextStyle } from "@/assets/dungeons/styles/DialogTextStyle";
import Text from "@/lib/phaser/components/Text.vue";
import { ActivePanel } from "@/models/dungeons/battle/menu/ActivePanel";
import { useInfoPanelStore } from "@/store/dungeons/battle/infoPanel";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";

const battleSceneStore = useBattleSceneStore();
const { activePanel } = storeToRefs(battleSceneStore);
const infoPanelStore = useInfoPanelStore();
// Display width is only going to be computed based on the set text, so we only need the @ listener prop
const { line1DialogMessage, line1TextDisplayWidth, line2Text } = storeToRefs(infoPanelStore);
</script>

<template>
  <!-- Info Panel is also shown when you choose options -->
  <template v-if="activePanel === ActivePanel.Info || activePanel === ActivePanel.Option">
    <Text
      :configuration="{
        x: 20,
        y: 468,
        text: line1DialogMessage.text,
        style: DialogTextStyle,
      }"
      @update:display-width="(value: typeof line1TextDisplayWidth) => (line1TextDisplayWidth = value)"
    />
    <Text
      :configuration="{
        x: 20,
        y: 512,
        text: line2Text,
        style: DialogTextStyle,
      }"
    />
    <DungeonsUIInputPromptCursor :height="480" />
  </template>
</template>
