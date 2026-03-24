import type { EntityIdKeys } from "#shared/models/entity/EntityIdKeys";
import type { Item } from "#shared/models/tableEditor/data/Item";
import type { TableEditor } from "#shared/models/tableEditor/data/TableEditor";
import type { ToData } from "@esposter/shared";
import type {
  _ExtractActionsFromSetupStore,
  _ExtractGettersFromSetupStore,
  _ExtractStateFromSetupStore,
  Store,
} from "pinia";

import {
  TableEditorConfiguration,
  tableEditorConfigurationSchema,
} from "#shared/models/tableEditor/data/TableEditorConfiguration";
import { TableEditorType } from "#shared/models/tableEditor/data/TableEditorType";
import { createEditFormData } from "@/services/shared/editForm/createEditFormData";
import { TABLE_EDITOR_LOCAL_STORAGE_KEY } from "@/services/tableEditor/constants";
import { useItemStore } from "@/store/tableEditor/item";
import { toRawDeep } from "@esposter/shared";

type TableEditorStoreState<
  TItem extends ToData<Item> = ToData<Item>,
  TIdKeys extends EntityIdKeys<TItem> = EntityIdKeys<TItem>,
> = ReturnType<typeof createEditFormData<TItem, TIdKeys>> & {
  importConfiguration: (data: Partial<TableEditor<ToData<Item>>>) => Promise<void>;
  save: (isDeleteAction?: true) => Promise<void>;
  searchQuery: Ref<string>;
  tableEditor: ComputedRef<TableEditor<TItem>>;
  tableEditorConfiguration: Ref<TableEditorConfiguration>;
  tableEditorType: Ref<TableEditorType>;
};

const id = "tableEditor";
const useBaseTableEditorStore = defineStore<typeof id, TableEditorStoreState>(id, () => {
  const { $trpc } = useNuxtApp();
  const itemStore = useItemStore();
  const { createItem, deleteItem, updateItem } = itemStore;
  const searchQuery = ref("");
  const tableEditorConfiguration = ref(new TableEditorConfiguration());
  const tableEditorType = ref(TableEditorType.TodoList);
  const tableEditor = computed(() => tableEditorConfiguration.value[tableEditorType.value]);
  const { editedIndex, editedItem, editFormDialog, ...rest } = createEditFormData(
    computed(() => tableEditor.value.items as Item[]),
    ["id"],
  );
  const saveTableEditorConfiguration = useSave(tableEditorConfiguration, {
    auth: { save: $trpc.tableEditor.saveTableEditorConfiguration.mutate },
    unauth: { key: TABLE_EDITOR_LOCAL_STORAGE_KEY, schema: tableEditorConfigurationSchema },
  });

  const saveConfiguration = async (snapshot: TableEditorConfiguration) => {
    const isSuccessful = await saveTableEditorConfiguration();
    if (!isSuccessful) tableEditorConfiguration.value = new TableEditorConfiguration(snapshot);
  };

  const save = async (isDeleteAction?: true) => {
    if (!editedItem.value) return;

    const snapshot = structuredClone(toRawDeep(tableEditorConfiguration.value));

    if (isDeleteAction) deleteItem({ id: editedItem.value.id });
    else if (editedIndex.value > -1) updateItem(editedItem.value);
    else createItem(editedItem.value);
    editFormDialog.value = false;

    await saveConfiguration(snapshot);
  };

  const importConfiguration = async (data: Partial<TableEditor<ToData<Item>>>) => {
    const snapshot = structuredClone(toRawDeep(tableEditorConfiguration.value));
    Object.assign(tableEditorConfiguration.value[tableEditorType.value], data);
    await saveConfiguration(snapshot);
  };

  return {
    editedIndex,
    editedItem,
    editFormDialog,
    searchQuery,
    tableEditor,
    tableEditorConfiguration,
    tableEditorType,
    ...rest,
    importConfiguration,
    save,
  };
});

export const useTableEditorStore = <TItem extends ToData<Item> = ToData<Item>>() =>
  useBaseTableEditorStore() as unknown as Store<
    typeof id,
    _ExtractStateFromSetupStore<TableEditorStoreState<TItem>>,
    _ExtractGettersFromSetupStore<TableEditorStoreState<TItem>>,
    _ExtractActionsFromSetupStore<TableEditorStoreState<TItem>>
  >;
