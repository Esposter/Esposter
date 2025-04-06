import type { EntityIdKeys } from "#shared/models/entity/EntityIdKeys";
import type { Item } from "#shared/models/tableEditor/Item";
import type { TableEditor } from "#shared/models/tableEditor/TableEditor";
import type {
  _ExtractActionsFromSetupStore,
  _ExtractGettersFromSetupStore,
  _ExtractStateFromSetupStore,
  Store,
} from "pinia";

import { TableEditorConfiguration } from "#shared/models/tableEditor/TableEditorConfiguration";
import { TableEditorType } from "#shared/models/tableEditor/TableEditorType";
import { authClient } from "@/services/auth/authClient";
import { createEditFormData } from "@/services/shared/editForm/createEditFormData";
import { saveItemMetadata } from "@/services/shared/metadata/saveItemMetadata";
import { TABLE_EDITOR_LOCAL_STORAGE_KEY } from "@/services/tableEditor/constants";
import { useItemStore } from "@/store/tableEditor/item";

type TableEditorStoreState<
  TItem extends Item = Item,
  TIdKeys extends EntityIdKeys<TItem> = EntityIdKeys<TItem>,
> = ReturnType<typeof createEditFormData<TItem, TIdKeys>> & {
  save: (isDeleteAction?: true) => Promise<void>;
  searchQuery: Ref<string>;
  tableEditor: ComputedRef<TableEditor<TItem>>;
  tableEditorConfiguration: Ref<TableEditorConfiguration>;
  tableEditorType: Ref<TableEditorType>;
};

const id = "tableEditor";
const useBaseTableEditorStore = defineStore<typeof id, TableEditorStoreState>(id, () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const itemStore = useItemStore();
  const { createItem, deleteItem, updateItem } = itemStore;
  const searchQuery = ref("");
  const tableEditorConfiguration = ref(new TableEditorConfiguration());
  const tableEditorType = ref(TableEditorType.TodoList);
  const tableEditor = computed(() => tableEditorConfiguration.value[tableEditorType.value]);
  const editFormData = createEditFormData(
    computed(() => tableEditor.value.items as Item[]),
    ["id"],
  );
  const save = async (isDeleteAction?: true) => {
    const { editedIndex, editedItem, editFormDialog } = editFormData;
    if (!editedItem.value) return;

    if (isDeleteAction) deleteItem({ id: editedItem.value.id });
    else if (editedIndex.value > -1) updateItem(editedItem.value);
    else createItem(editedItem.value);

    if (session.value.data) {
      saveItemMetadata(tableEditorConfiguration.value);
      await $trpc.tableEditor.saveTableEditor.mutate(tableEditorConfiguration.value);
    } else {
      saveItemMetadata(tableEditorConfiguration.value);
      localStorage.setItem(TABLE_EDITOR_LOCAL_STORAGE_KEY, tableEditorConfiguration.value.toJSON());
    }
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
