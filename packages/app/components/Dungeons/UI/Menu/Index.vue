<script setup lang="ts" generic="TValue extends string, TGrid extends readonly (readonly TValue[])[]">
import type { Grid } from "@/models/dungeons/Grid";
import type { Position } from "grid-engine";

import Container from "@/lib/phaser/components/Container.vue";
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import { MENU_DEPTH, MENU_WIDTH } from "@/services/dungeons/UI/menu/constants";
import { getMenuHeight } from "@/services/dungeons/UI/menu/getMenuHeight";

interface MenuProps {
  position: Position;
}

const { position } = defineProps<MenuProps>();
const menu = defineModel<boolean>("menu", { required: true });
const grid = defineModel<Grid<TValue, TGrid>>("grid", { required: true });
const { border, primary } = useDungeonsColors();
const menuHeight = computed(() => getMenuHeight(grid.value.rowSize));
</script>

<template>
  <Container :configuration="{ visible: menu, ...position, depth: MENU_DEPTH }">
    <Rectangle
      :configuration="{
        x: 1,
        width: MENU_WIDTH - 1,
        height: menuHeight - 1,
        origin: 0,
        fillColor: primary,
        alpha: 0.9,
        strokeStyle: [8, border],
      }"
      @clickoutside="menu = false"
    />
    <DungeonsUIMenuContent v-model:grid="grid" />
  </Container>
</template>
