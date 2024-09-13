<script setup lang="ts">
import { ActivePanel } from "@/models/dungeons/scene/battle/menu/ActivePanel";
import { SceneEventKey } from "@/models/dungeons/scene/SceneEventKey";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { MENU_HEIGHT, MENU_PADDING } from "@/services/dungeons/scene/battle/menu/constants";
import { onSceneEvent } from "@/services/phaser/hooks/onSceneEvent";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";
import { useControlsStore } from "@/store/dungeons/controls";
import { Input } from "phaser";
import { onCreate, Rectangle } from "vue-phaserjs";

const controlsStore = useControlsStore();
const { controls } = storeToRefs(controlsStore);
const battleSceneStore = useBattleSceneStore();
const { activePanel } = storeToRefs(battleSceneStore);
const y = ref<number>();
const width = ref<number>();

onCreate((scene) => {
  y.value = scene.scale.height - MENU_HEIGHT - MENU_PADDING;
  width.value = scene.scale.width - MENU_PADDING * 2;
});

onSceneEvent(SceneEventKey.ShowMessage, () => {
  activePanel.value = ActivePanel.Info;
});
</script>

<template>
  <Rectangle
    :configuration="{
      x: MENU_PADDING,
      y,
      origin: 0,
      width,
      height: MENU_HEIGHT,
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
