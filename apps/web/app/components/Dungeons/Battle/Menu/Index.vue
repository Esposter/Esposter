<script setup lang="ts">
import { ActivePanel } from "#src/models/dungeons/scene/battle/menu/ActivePanel";
import { SceneEventKey } from "#src/models/dungeons/scene/SceneEventKey";
import { PlayerSpecialInput } from "#src/models/dungeons/UI/input/PlayerSpecialInput";
import { MENU_HEIGHT, MENU_PADDING } from "#src/services/dungeons/scene/battle/menu/constants";
import { HIGHLIGHT_BORDER_COLOR, PANEL_FILL_COLOR } from "#src/services/dungeons/UI/constants";
import { onSceneEvent } from "#src/services/phaser/hooks/onSceneEvent";
import { useBattleSceneStore } from "#src/store/dungeons/battle/scene";
import { useControlsStore } from "#src/store/dungeons/controls";
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
      fillColor: PANEL_FILL_COLOR,
      strokeStyle: [MENU_PADDING * 2, HIGHLIGHT_BORDER_COLOR],
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
