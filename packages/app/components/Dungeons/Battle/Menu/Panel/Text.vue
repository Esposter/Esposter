<script setup lang="ts" generic="TValue, TGrid extends readonly (readonly TValue[])[]">
import { DialogTextStyle } from "@/assets/dungeons/styles/DialogTextStyle";
import Text from "@/lib/phaser/components/Text.vue";
import type { Grid } from "@/models/dungeons/Grid";
import type { Position } from "grid-engine";
import { Input } from "phaser";

interface TextProps {
  gridPosition: Position;
  position: Position;
  text: string;
}

const { gridPosition, position, text } = defineProps<TextProps>();
const grid = defineModel<Grid<TValue, TGrid>>("grid", { required: true });
const onGridClick = useOnGridClick(grid, () => gridPosition);
</script>

<template>
  <Text
    :configuration="{ ...position, text, style: DialogTextStyle }"
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="onGridClick"
  />
</template>
