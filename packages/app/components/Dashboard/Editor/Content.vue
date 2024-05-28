<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { VisualTypeChartDataMap } from "@/services/dashboard/chart/VisualTypeChartDataMap";
import { ITEM_ID_QUERY_PARAM_KEY } from "@/services/tableEditor/constants";
import { useVisualStore } from "@/store/dashboard/visual";
import { uuidValidateV4 } from "@/util/id/uuid/uuidValidateV4";
import { Vjsf } from "@koumoul/vjsf";
import { GridItem, GridLayout } from "grid-layout-plus";

const route = useRoute();
const visualStore = useVisualStore();
const { save, editItem, resetItem } = visualStore;
const {
  visuals,
  noColumns,
  editedItem,
  editFormDialog,
  editFormRef,
  isEditFormValid,
  isFullScreenDialog,
  isDirty,
  isSavable,
} = storeToRefs(visualStore);
const { background, border, surface } = useColors();

useConfirmBeforeNavigation(isDirty);

onMounted(async () => {
  const itemId = route.query[ITEM_ID_QUERY_PARAM_KEY];
  if (typeof itemId === "string" && uuidValidateV4(itemId)) await editItem(itemId);
});
</script>

<template>
  <v-container flex-1 fluid>
    <GridLayout v-model:layout="visuals" :col-num="noColumns" :row-height="40" :use-style-cursor="false">
      <GridItem
        v-for="{ id, type, configuration, x, y, w, h } in visuals"
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
          :name="`${configuration.type} ${type} Visual`"
          :edited-item
          :is-edit-form-valid
          :is-full-screen-dialog
          :is-savable
          @update:edit-form-ref="(value) => (editFormRef = value)"
          @update:fullscreen-dialog="(value) => (isFullScreenDialog = value)"
          @save="save()"
          @close="resetItem()"
        >
          <v-container fluid>
            <Vjsf v-model="editedItem.configuration" :schema="VisualTypeChartDataMap[type].schema" />
          </v-container>
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
