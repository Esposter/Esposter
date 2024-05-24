<script setup lang="ts">
import type { Layout, LayoutItem } from "grid-layout-plus";
import { GridItem, GridLayout } from "grid-layout-plus";
import type { Except } from "type-fest";

const baseLayout: Except<LayoutItem, "i">[] = [
  { x: 0, y: 0, w: 2, h: 2 },
  { x: 2, y: 0, w: 2, h: 4 },
];
const layout = ref<Layout>(baseLayout.map((l, i) => ({ ...l, i })));
</script>

<template>
  <NuxtLayout>
    <v-container h-full flex justify-center items-center>
      <GridLayout
        v-model:layout="layout"
        :col-num="12"
        :row-height="30"
        is-draggable
        is-resizable
        vertical-compact
        use-css-transforms
      >
        <GridItem v-for="{ i, x, y, w, h } in layout" :key="i" :x="x" :y="y" :w="w" :h="h" :i="i">
          {{ i }}
        </GridItem>
      </GridLayout>
    </v-container>
  </NuxtLayout>
</template>

<style scoped lang="scss"></style>
