<script setup lang="ts">
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { ActivePanel } from "@/models/dungeons/battle/menu/ActivePanel";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { MENU_HEIGHT, MENU_PADDING } from "@/services/dungeons/battle/menu/constants";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";
import { useGameStore } from "@/store/dungeons/game";
import { Input } from "phaser";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const battleSceneStore = useBattleSceneStore();
const { activePanel } = storeToRefs(battleSceneStore);
const y = computed(() => scene.value.scale.height - MENU_HEIGHT - MENU_PADDING);
const width = computed(() => scene.value.scale.width - MENU_PADDING * 2);
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
    @[`${Input.Events.POINTER_UP}`]="
      () => {
        if (activePanel === ActivePanel.Info) controls.setInput(PlayerSpecialInput.Confirm);
      }
    "
  />
  <DungeonsBattleMenuPanelAttackOption />
  <DungeonsBattleMenuPanelInfo />
  <DungeonsBattleMenuPanelOption />
</template>
