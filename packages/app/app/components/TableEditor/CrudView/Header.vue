<script setup lang="ts">
import { TableEditorType } from "#shared/models/tableEditor/data/TableEditorType";
import { TableEditorTypeItemSchemaMap } from "@/services/tableEditor/TableEditorTypeItemSchemaMap";
import { useTableEditorStore } from "@/store/tableEditor";
import { RoutePath, withFinalizerAsync } from "@esposter/shared";

const slots = defineSlots<{ "append-header": () => VNode; "prepend-actions": () => VNode }>();
const tableEditorStore = useTableEditorStore();
const { resetItem, save } = tableEditorStore;
const {
  editedItem,
  editForm,
  editFormDialog,
  isDirty,
  isEditFormValid,
  isFullScreenDialog,
  isSavable,
  originalItem,
  tableEditorType,
} = storeToRefs(tableEditorStore);
const component = computed(() => (editedItem.value ? useEditFormComponent(editedItem.value.type) : undefined));
const schema = computed(() => TableEditorTypeItemSchemaMap[tableEditorType.value]);
</script>

<template>
  <StyledPageHeader>
    <template #filters>
      <TableEditorTypeSelect />
      <TableEditorSearchBar />
    </template>
    <template #actions>
      <StyledTooltipIconButton
        v-if="tableEditorType === TableEditorType.TodoList"
        icon="mdi-calendar"
        text="Calendar"
        @click="navigateTo(RoutePath.Calendar)"
      />
      <TableEditorCreateItemButton />
      <TableEditorExportButton />
      <TableEditorImportButton />
      <slot name="append-header" />
    </template>
  </StyledPageHeader>
  <StyledEditFormDialog
    v-if="editedItem"
    v-model="editFormDialog"
    :name="originalItem?.name ?? ''"
    :edited-item
    :original-item
    :is-dirty
    :is-edit-form-valid
    :schema
    :is-full-screen-dialog
    :is-savable
    @close="resetItem()"
    @delete="
      async (onComplete) => {
        await withFinalizerAsync(() => save(true), onComplete);
      }
    "
    @save="save()"
    @update:edit-form="editForm = $event"
    @update:fullscreen-dialog="isFullScreenDialog = $event"
  >
    <template v-if="slots['prepend-actions']" #prepend-actions>
      <slot name="prepend-actions" />
    </template>
    <component :is="component" v-model="editedItem" />
  </StyledEditFormDialog>
</template>
