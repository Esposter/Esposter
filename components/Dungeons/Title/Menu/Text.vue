<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/title/styles/MenuTextStyle";
import Text from "@/lib/phaser/components/Text.vue";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { PlayerTitleMenuOption } from "@/models/dungeons/title/menu/PlayerTitleMenuOption";
import { MENU_BACKGROUND_DISPLAY_WIDTH } from "@/services/dungeons/title/menu/constants";
import { useGameStore } from "@/store/dungeons/game";
import { useTitleSceneStore } from "@/store/dungeons/title/scene";
import type { Position } from "grid-engine";
import { Input } from "phaser";

const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const titleSceneStore = useTitleSceneStore();
const { isContinueEnabled, optionGrid, cursorPositionMap } = storeToRefs(titleSceneStore);
const cursorPositions = computed(() => cursorPositionMap.value.flatMap<Position>((positions) => positions));
</script>

<template>
  <Text
    v-for="({ y }, index) in cursorPositions"
    :key="index"
    :configuration="{
      x: MENU_BACKGROUND_DISPLAY_WIDTH / 2,
      y: y - 1,
      text: optionGrid.getValue(index),
      style: MenuTextStyle,
      origin: 0.5,
    }"
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="
      () => {
        if (optionGrid.index === index) controls.setInput(PlayerSpecialInput.Confirm);
        else optionGrid.index = index;
      }
    "
  />
  <Text
    :configuration="{
      visible: !isContinueEnabled,
      x: MENU_BACKGROUND_DISPLAY_WIDTH / 2,
      y: 90,
      text: PlayerTitleMenuOption.Continue,
      style: MenuTextStyle,
      origin: 0.5,
      alpha: 0.5,
    }"
  />
</template>
