<script setup lang="ts">
import { battleUITextStyle } from "@/assets/dungeons/styles/battleUITextStyle";
import Text from "@/lib/phaser/components/Text.vue";
import { ActivePanel } from "@/models/dungeons/battle/UI/menu/ActivePanel";
import { useBattleSceneStore } from "@/store/dungeons/scene/battle";
import { useInfoPanelStore } from "@/store/dungeons/scene/battle/infoPanel";

const battleSceneStore = useBattleSceneStore();
const { activePanel } = storeToRefs(battleSceneStore);
const infoPanelStore = useInfoPanelStore();
const { line1Text, line2Text, isPlayerInputPromptCursorVisible } = storeToRefs(infoPanelStore);
</script>

<template>
  <template v-if="activePanel === ActivePanel.Info">
    <Text
      :configuration="{
        x: 20,
        y: 468,
        text: line1Text,
        style: battleUITextStyle,
      }"
    />
    <Text
      :configuration="{
        x: 20,
        y: 512,
        text: line2Text,
        style: battleUITextStyle,
      }"
    />
    <DungeonsBattleMenuPlayerInputPromptCursor :is-visible="isPlayerInputPromptCursorVisible" />
  </template>
</template>
