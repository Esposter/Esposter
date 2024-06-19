<script setup lang="ts">
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import { useInputStore } from "@/lib/phaser/store/input";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { ActivePanel } from "@/models/dungeons/scene/battle/menu/ActivePanel";
import { MENU_HEIGHT, MENU_PADDING } from "@/services/dungeons/scene/battle/menu/constants";
import { onShowMessage } from "@/services/phaser/hooks/onShowMessage";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";
import { Input } from "phaser";

const inputStore = useInputStore();
const { controls } = storeToRefs(inputStore);
const battleSceneStore = useBattleSceneStore();
const { activePanel } = storeToRefs(battleSceneStore);
const y = ref<number>();
const width = ref<number>();

onCreate((scene) => {
  y.value = scene.scale.height - MENU_HEIGHT - MENU_PADDING;
  width.value = scene.scale.width - MENU_PADDING * 2;
});

onShowMessage(() => {
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
