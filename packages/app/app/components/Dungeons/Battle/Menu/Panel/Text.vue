<script setup lang="ts" generic="TGrid extends readonly (readonly unknown[])[]">
import type { Grid } from "@/models/dungeons/Grid";
import type { Position } from "grid-engine";

import { DialogTextStyle } from "@/assets/dungeons/styles/DialogTextStyle";
import { Input } from "phaser";
import { Text } from "vue-phaserjs";

interface Props {
  grid: Grid<TGrid>;
  gridPosition: Position;
  position: Position;
  text: string;
}

const { grid, gridPosition, position, text } = defineProps<Props>();
const onGridClick = useOnGridClick(grid, () => gridPosition);
</script>

<template>
  <Text
    :configuration="{ ...position, text, style: DialogTextStyle }"
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="onGridClick"
  />
</template>
