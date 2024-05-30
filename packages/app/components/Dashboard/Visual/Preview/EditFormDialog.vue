<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { Visual } from "@/models/dashboard/Visual";
import { VisualDataMap } from "@/services/dashboard/chart/VisualDataMap";
import { useVisualStore } from "@/store/dashboard/visual";
import { Vjsf } from "@koumoul/vjsf";

const editedItem = defineModel<Visual>({ required: true });
const visualStore = useVisualStore();
const { save, resetItem } = visualStore;
const { editFormDialog, editFormRef, isEditFormValid, isFullScreenDialog, isDirty, isSavable } =
  storeToRefs(visualStore);
const visualData = computed(() => VisualDataMap[editedItem.value.type]);
const schema = computed(() => visualData.value.chartDataMap[editedItem.value.chart.type].schema);

useConfirmBeforeNavigation(isDirty);
</script>

<template>
  <StyledEditFormDialog
    v-model="editFormDialog"
    :name="`${editedItem.chart.type} ${editedItem.type} Visual`"
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
      <v-select v-model="editedItem.chart.type" :items="Object.values(visualData.typeEnum)" label="Chart Type" />
      <Vjsf v-model="editedItem.chart.configuration" :schema :options="{ removeAdditional: true }" />
    </v-container>
  </StyledEditFormDialog>
</template>
