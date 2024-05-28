<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { VisualTypeChartDataMap } from "@/services/dashboard/chart/VisualTypeChartDataMap";
import { useVisualStore } from "@/store/dashboard/visual";
import { Vjsf } from "@koumoul/vjsf";
import { GridItem, GridLayout } from "grid-layout-plus";

const visualStore = useVisualStore();
const { save, editItem, resetItem } = visualStore;
const {
  visuals,
  noColumns,
  editedItem,
  editFormDialog,
  editFormRef,
  originalItem,
  isEditFormValid,
  isFullScreenDialog,
  isSavable,
} = storeToRefs(visualStore);
const { background, border, surface } = useColors();
</script>

<template>
  <v-container flex-1 fluid>
    <GridLayout v-model:layout="visuals" :col-num="noColumns" :row-height="40" :use-style-cursor="false">
      <GridItem
        v-for="({ id, type, x, y, w, h }, index) in visuals"
        :key="id"
        :i="id"
        text-center
        content-center
        :x
        :y
        :w
        :h
      >
        <DashboardVisualPreview :type @click="editItem(id)" />
        <DashboardVisualPreviewRemoveButton :id :type />
        <StyledEditFormDialog
          v-if="editedItem"
          v-model="editFormDialog"
          :name="type"
          :edited-item
          :original-item
          :is-edit-form-valid
          :is-full-screen-dialog
          :is-savable
          @update:edit-form-ref="(value) => (editFormRef = value)"
          @update:fullscreen-dialog="(value) => (isFullScreenDialog = value)"
          @save="save()"
          @close="resetItem()"
          @delete="
            async (onComplete) => {
              await save();
              onComplete();
            }
          "
        >
          <Vjsf v-model="visuals[index]" :schema="VisualTypeChartDataMap[type].schema" />
        </StyledEditFormDialog>
      </GridItem>
    </GridLayout>
  </v-container>
</template>

<style scoped lang="scss">
:deep(.vgl-layout) {
  width: 100%;
  min-height: 100%;
  background-color: v-bind(background);
  border-radius: $border-radius-root;
}

:deep(.vgl-item) {
  cursor: pointer;

  &:active:not(:focus-within) {
    opacity: var(--v-medium-emphasis-opacity);
  }

  &:not(.vgl-item--placeholder) {
    background-color: v-bind(surface);
    border: 1px $border-style-root v-bind(border);
  }
}
</style>
