<script setup lang="ts">
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { SHOW_MESSAGE_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import { ActivePanel } from "@/models/dungeons/battle/menu/ActivePanel";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { MENU_HEIGHT, MENU_PADDING } from "@/services/dungeons/battle/menu/constants";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";
import { useGameStore } from "@/store/dungeons/game";
import { Input } from "phaser";

const phaserStore = usePhaserStore();
const { scene, sceneKey } = storeToRefs(phaserStore);
const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const battleSceneStore = useBattleSceneStore();
const { activePanel } = storeToRefs(battleSceneStore);
const y = computed(() => scene.value.scale.height - MENU_HEIGHT - MENU_PADDING);
const width = computed(() => scene.value.scale.width - MENU_PADDING * 2);

usePhaserListener(`${SHOW_MESSAGE_SCENE_EVENT_KEY}${sceneKey.value}`, () => {
  activePanel.value = ActivePanel.Info;
});
</script>

<template>
  <Rectangle
    :configuration="{
      x: MENU_PADDING,
      y,
      width,
      height: MENU_HEIGHT,
      origin: 0,
      fillColor: 0xede4f3,
      strokeStyle: [MENU_PADDING * 2, 0xe4434a],
    }"
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="
      () => {
        if (activePanel === ActivePanel.Info) controls.setInput(PlayerSpecialInput.Confirm);
      }
    "
  />
  <DungeonsBattleMenuPanelAttackOption />
  <DungeonsBattleMenuPanelInfo />
  <DungeonsBattleMenuPanelOption />
</template>
