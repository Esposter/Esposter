import type { Item } from "@/models/tableEditor/Item";

import { TableEditorConfiguration } from "@/models/tableEditor/TableEditorConfiguration";
import { TableEditorType } from "@/models/tableEditor/TableEditorType";
import { createEditFormData } from "@/services/shared/editForm/createEditFormData";
import { TABLE_EDITOR_LOCAL_STORAGE_KEY } from "@/services/tableEditor/constants";
import { useItemStore } from "@/store/tableEditor/item";

// @TODO: Vue cannot unwrap generic refs yet
// https://github.com/vuejs/core/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+unwrap
// https://github.com/vuejs/core/issues/6766
export const useTableEditorStore = <TItem extends Item = Item>() =>
  defineStore("tableEditor", () => {
    const { $client } = useNuxtApp();
    const { status } = useAuth();
    const itemStore = useItemStore();
    const { createItem, deleteItem, updateItem } = itemStore;
    const searchQuery = ref("");
    const tableEditorConfiguration = ref(new TableEditorConfiguration());
    const tableEditorType = ref(TableEditorType.TodoList);
    const tableEditor = computed(() => tableEditorConfiguration.value[tableEditorType.value] as { items: TItem[] });
    const editFormData = createEditFormData(computed(() => tableEditor.value.items));
    const save = async (isDeleteAction?: true) => {
      const { editedIndex, editedItem, editFormDialog } = editFormData;
      if (!editedItem.value) return;

      if (isDeleteAction) deleteItem(editedItem.value.id);
      else if (editedIndex.value > -1) updateItem(editedItem.value);
      else createItem(editedItem.value);

      if (status.value === "authenticated")
        await $client.tableEditor.saveTableEditor.mutate(tableEditorConfiguration.value);
      else if (status.value === "unauthenticated")
        localStorage.setItem(TABLE_EDITOR_LOCAL_STORAGE_KEY, tableEditorConfiguration.value.toJSON());
      editFormDialog.value = false;
    };

    return {
      searchQuery,
      tableEditor,
      tableEditorConfiguration,
      ...editFormData,
      save,
    };
  });
