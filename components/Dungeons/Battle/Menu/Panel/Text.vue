<script setup lang="ts" generic="TEnum extends string">
import { DialogTextStyle } from "@/assets/dungeons/styles/DialogTextStyle";
import Text from "@/lib/phaser/components/Text.vue";
import type { Grid } from "@/models/dungeons/Grid";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { useGameStore } from "@/store/dungeons/game";
import type { Position } from "grid-engine";
import { Input } from "phaser";

interface TextProps {
  index: number;
  position: Position;
}

const { index, position } = defineProps<TextProps>();
const grid = defineModel<Grid<TEnum>>("grid", { required: true });
const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
</script>

<template>
  <Text
    :configuration="{
      ...position,
      text: grid.getValue(index),
      style: DialogTextStyle,
    }"
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="
      () => {
        if (grid.index === index) controls.setInput(PlayerSpecialInput.Confirm);
        else grid.index = index;
      }
    "
  />
</template>
