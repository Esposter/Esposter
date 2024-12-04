<script setup lang="ts" generic="TValue, TGrid extends readonly (readonly TValue[])[]">
import type { Grid } from "@/models/dungeons/Grid";
import type { Position } from "grid-engine";

import { DialogTextStyle } from "@/assets/dungeons/styles/DialogTextStyle";
import { Input } from "phaser";
import { Text } from "vue-phaserjs";

interface TextProps {
  grid: Grid<TValue, TGrid>;
  gridPosition: Position;
  position: Position;
  text: string;
}

const { grid, gridPosition, position, text } = defineProps<TextProps>();
const onGridClick = useOnGridClick(grid, () => gridPosition);
</script>

<template>
  <Text
    :configuration="{ ...position, text, style: DialogTextStyle }"
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="onGridClick"
  />
</template>
