<script setup lang="ts">
import type { Layout, LayoutItem } from "grid-layout-plus";
import { GridItem, GridLayout } from "grid-layout-plus";
import type { Except } from "type-fest";

const { background, border, surface } = useColors();
const baseLayout: Except<LayoutItem, "i">[] = [
  { x: 0, y: 0, w: 2, h: 2 },
  { x: 2, y: 0, w: 2, h: 4 },
];
const layout = ref<Layout>(baseLayout.map((l) => ({ ...l, i: crypto.randomUUID() })));
</script>

<template>
  <NuxtLayout>
    <v-container h-full fluid>
      <StyledCard size-full>
        <v-toolbar>
          <v-toolbar-title font-bold="!">
            <div pt-4 flex items-center justify-between>
              Dashboard Layout Editor
              <div w-full flex items-center pl-4 mr-2>
                <v-select label="Dashboard Visual" hide-details />
                <v-btn ml-2 variant="elevated" :flat="false">
                  <v-icon icon="mdi-plus" />
                </v-btn>
              </div>
            </div>
          </v-toolbar-title>
        </v-toolbar>
        <v-container flex h-full fluid>
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
      </StyledCard>
    </v-container>
  </NuxtLayout>
</template>

<style scoped lang="scss">
:deep(.v-toolbar__content) {
  height: auto !important;
}

:deep(.vgl-layout) {
  height: 100% !important;
  background-color: v-bind(background);
}

:deep(.vgl-item:not(.vgl-item--placeholder)) {
  background-color: v-bind(surface);
  border: 1px $border-style-root v-bind(border);
}
</style>
