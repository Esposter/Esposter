<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { TableEditorTypeItemSchemaMap } from "@/services/tableEditor/TableEditorTypeItemSchemaMap";
import { useTableEditorStore } from "@/store/tableEditor";
import { withFinalizerAsync } from "@esposter/shared";

const slots = defineSlots<{ "append-header": () => VNode; "prepend-actions": () => VNode }>();
const session = authClient.useSession();
const tableEditorStore = useTableEditorStore();
const { createDocument, deleteDocument, renameDocument, resetItem, save, selectDocument } = tableEditorStore;
const {
  currentDocument,
  documents,
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
  <v-toolbar pt-4>
    <v-toolbar-title px-4>
      <TableEditorTypeSelect />
      <div v-if="session.data" pt-2 flex w-full items-center gap-2>
        <DocumentPicker
          :current-document="currentDocument"
          :documents
          @create="createDocument($event)"
          @delete="deleteDocument($event)"
          @rename="(id, name) => renameDocument(id, name)"
          @select="selectDocument($event)"
        />
      </div>
      <div pt-2>
        <TableEditorSearchBar />
      </div>
      <div py-2 flex flex-wrap gap-2>
        <v-spacer />
        <TableEditorCreateItemButton />
        <TableEditorExportButton />
        <TableEditorImportButton />
        <slot name="append-header" />
      </div>
    </v-toolbar-title>
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
  </v-toolbar>
</template>
