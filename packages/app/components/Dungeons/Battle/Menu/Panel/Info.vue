<script setup lang="ts">
import { DialogTextStyle } from "@/assets/dungeons/styles/DialogTextStyle";
import Text from "@/lib/phaser/components/Text.vue";
import { useInjectSceneKey } from "@/lib/phaser/composables/useInjectSceneKey";
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import { getScene } from "@/lib/phaser/util/getScene";
import { ActivePanel } from "@/models/dungeons/scene/battle/menu/ActivePanel";
import { WORD_PADDING } from "@/services/dungeons/UI/constants";
import { levelUp } from "@/services/dungeons/monster/levelUp";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useInfoPanelStore } from "@/store/dungeons/battle/infoPanel";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";
import { useSettingsStore } from "@/store/dungeons/settings";

const settingsStore = useSettingsStore();
const { isSkipAnimations } = storeToRefs(settingsStore);
const battleSceneStore = useBattleSceneStore();
const { activePanel } = storeToRefs(battleSceneStore);
const battleDialogStore = useBattleDialogStore();
const { showMessages } = battleDialogStore;
const infoPanelStore = useInfoPanelStore();
const { line1DialogMessage, line1TextDisplayWidth, line2Text } = storeToRefs(infoPanelStore);
const wordWrapWidth = ref<number>();

onCreate((scene) => {
  wordWrapWidth.value = scene.scale.width - WORD_PADDING;
});

const sceneKey = useInjectSceneKey();

usePhaserListener("levelUp", async (monster, onComplete, isManualSkipAnimations) => {
  const scene = getScene(sceneKey);
  const { experienceToNextLevel } = useExperience(monster);
  if (isManualSkipAnimations ?? isSkipAnimations.value) while (experienceToNextLevel.value <= 0) levelUp(monster);
  else levelUp(monster);
  await showMessages(scene, [`${monster.key} leveled up to ${monster.stats.level}!`], onComplete);
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
    <DungeonsUIInputPromptCursor :y="480" />
  </template>
</template>
