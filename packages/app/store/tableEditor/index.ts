import type { Item } from "@/models/tableEditor/Item";
import type { TableEditor } from "@/models/tableEditor/TableEditor";
import type {
  _ExtractActionsFromSetupStore,
  _ExtractGettersFromSetupStore,
  _ExtractStateFromSetupStore,
  Store,
} from "pinia";

import { TableEditorConfiguration } from "@/models/tableEditor/TableEditorConfiguration";
import { TableEditorType } from "@/models/tableEditor/TableEditorType";
import { createEditFormData } from "@/services/shared/editForm/createEditFormData";
import { TABLE_EDITOR_LOCAL_STORAGE_KEY } from "@/services/tableEditor/constants";
import { useItemStore } from "@/store/tableEditor/item";

type TableEditorStoreState<TItem extends Item = Item> = {
  save: (isDeleteAction?: true) => Promise<void>;
  searchQuery: Ref<string>;
  tableEditor: ComputedRef<TableEditor<TItem>>;
  tableEditorConfiguration: Ref<TableEditorConfiguration>;
  tableEditorType: Ref<TableEditorType>;
} & ReturnType<typeof createEditFormData<TItem>>;

const id = "tableEditor";
const useBaseTableEditorStore = defineStore<typeof id, TableEditorStoreState>(id, () => {
  const { $client } = useNuxtApp();
  const { status } = useAuth();
  const itemStore = useItemStore();
  const { createItem, deleteItem, updateItem } = itemStore;
  const searchQuery = ref("");
  const tableEditorConfiguration = ref(new TableEditorConfiguration());
  const tableEditorType = ref(TableEditorType.TodoList);
  const tableEditor = computed(() => tableEditorConfiguration.value[tableEditorType.value]);
  const editFormData = createEditFormData<Item>(computed(() => tableEditor.value.items));
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
    tableEditorType,
    ...editFormData,
    save,
  };
});

export const useTableEditorStore = <TItem extends Item = Item>() =>
  useBaseTableEditorStore() as unknown as Store<
    typeof id,
    _ExtractStateFromSetupStore<TableEditorStoreState<TItem>>,
    _ExtractGettersFromSetupStore<TableEditorStoreState<TItem>>,
    _ExtractActionsFromSetupStore<TableEditorStoreState<TItem>>
  >;
