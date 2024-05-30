<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { Chart } from "@/models/dashboard/chart/Chart";
import type { Visual } from "@/models/dashboard/Visual";
import { VisualType } from "@/models/dashboard/VisualType";
import { VisualDataMap } from "@/services/dashboard/chart/VisualDataMap";
import { ITEM_ID_QUERY_PARAM_KEY, ITEM_TYPE_QUERY_PARAM_KEY } from "@/services/shared/constants";
import { useVisualStore } from "@/store/dashboard/visual";
import { uuidValidateV4 } from "@/util/id/uuid/uuidValidateV4";
import { Vjsf } from "@koumoul/vjsf";

interface VisualPreviewContainerProps {
  id: Visual["id"];
  type: Visual["type"];
  chartType: Chart["type"];
}

const { id, type, chartType } = defineProps<VisualPreviewContainerProps>();
const route = useRoute();
const visualStore = useVisualStore();
const { save, editItem, resetItem } = visualStore;
const { visualType, editedItem, editFormDialog, editFormRef, isEditFormValid, isFullScreenDialog, isDirty, isSavable } =
  storeToRefs(visualStore);
const divRef = ref<HTMLDivElement>();

useConfirmBeforeNavigation(isDirty);

onClickExceptDrag(divRef, () => {
  editItem(id);
});

onMounted(async () => {
  const itemType = route.query[ITEM_TYPE_QUERY_PARAM_KEY];
  if (Object.values(VisualType).some((type) => type === itemType)) visualType.value = itemType as VisualType;

  const itemId = route.query[ITEM_ID_QUERY_PARAM_KEY];
  if (typeof itemId === "string" && uuidValidateV4(itemId)) await editItem(itemId);
});
</script>

<template>
  <div ref="divRef">
    <DashboardVisualPreview :type />
    <DashboardVisualPreviewRemoveButton :id :type />
    <StyledEditFormDialog
      v-if="editedItem"
      v-model="editFormDialog"
      :name="`${chartType} ${type} Visual`"
      :edited-item
      :is-edit-form-valid
      :is-full-screen-dialog
      :is-savable
      @update:edit-form-ref="(value) => (editFormRef = value)"
      @update:fullscreen-dialog="(value) => (isFullScreenDialog = value)"
      @save="save(editedItem)"
      @close="resetItem()"
    >
      <v-container fluid>
        <v-select
          v-model="editedItem.chart.type"
          :items="Object.values(VisualDataMap[type].typeEnum)"
          label="Chart Type"
        />
        <Vjsf v-model="editedItem.chart.configuration" :schema="VisualDataMap[type].data.schema" />
      </v-container>
    </StyledEditFormDialog>
  </div>
</template>
