<script setup lang="ts" generic="TValue, TGrid extends ReadonlyArray<ReadonlyArray<TValue>>">
import { DialogTextStyle } from "@/assets/dungeons/styles/DialogTextStyle";
import Text from "@/lib/phaser/components/Text.vue";
import type { Grid } from "@/models/dungeons/Grid";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { useGameStore } from "@/store/dungeons/game";
import deepEqual from "deep-equal";
import type { Position } from "grid-engine";
import { Input } from "phaser";

interface TextProps {
  gridPosition: Position;
  text: string;
  position: Position;
}

const { gridPosition, position } = defineProps<TextProps>();
const grid = defineModel<Grid<TValue, TGrid>>("grid", { required: true });
const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
</script>

<template>
  <Text
    :configuration="{ ...position, text, style: DialogTextStyle }"
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="
      () => {
        if (deepEqual(gridPosition, grid.position)) controls.setInput(PlayerSpecialInput.Confirm);
        else grid.position = gridPosition;
      }
    "
  />
</template>
