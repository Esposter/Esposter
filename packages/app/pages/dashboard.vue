<script setup lang="ts">
import type { Layout, LayoutItem } from "grid-layout-plus";
import { GridItem, GridLayout } from "grid-layout-plus";
import type { Except } from "type-fest";

const { background, border, surface } = useColors();
const baseLayout: Except<LayoutItem, "i">[] = [
  { x: 0, y: 0, w: 2, h: 2 },
  { x: 2, y: 0, w: 2, h: 4 },
];
const noColumns = ref(12);
const layout = ref<Layout>(baseLayout.map((l) => ({ ...l, i: crypto.randomUUID() })));
const addItem = () => {
  layout.value.push({
    x: (layout.value.length * 2) % noColumns.value,
    // Puts the item at the bottom
    y: layout.value.length + noColumns.value,
    w: 2,
    h: 2,
    i: crypto.randomUUID(),
  });
};

const removeItem = (id: string) => {
  const index = layout.value.findIndex(({ i }) => i === id);
  if (index === -1) return;
  layout.value.splice(index, 1);
};
</script>

<template>
  <NuxtLayout>
    <v-container h-full fluid>
      <StyledCard flex="!" flex-col size-full>
        <v-toolbar>
          <v-toolbar-title font-bold="!">
            <div pt-4 flex items-center justify-between>
              Dashboard Layout Editor
              <div w-full flex items-center pl-4 mr-2>
                <v-select label="Dashboard Visual" hide-details />
                <v-btn ml-2 variant="elevated" :flat="false" @click="addItem">
                  <v-icon icon="mdi-plus" />
                </v-btn>
              </div>
            </div>
          </v-toolbar-title>
        </v-toolbar>
        <v-container flex-1 fluid>
          <GridLayout
            v-model:layout="layout"
            :col-num="noColumns"
            :row-height="30"
            is-draggable
            is-resizable
            vertical-compact
            use-css-transforms
          >
            <GridItem
              v-for="{ i, x, y, w, h } in layout"
              :key="i"
              content-center
              text-center
              :x="x"
              :y="y"
              :w="w"
              :h="h"
              :i="i"
            >
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
  width: 100%;
  min-height: 100%;
  background-color: v-bind(background);
  border-radius: $border-radius-root;
}

:deep(.vgl-item:not(.vgl-item--placeholder)) {
  background-color: v-bind(surface);
  border: 1px $border-style-root v-bind(border);
}
</style>
