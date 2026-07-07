import type { Item } from "#shared/models/tableEditor/data/Item";
import type { TableEditor } from "#shared/models/tableEditor/data/TableEditor";
import type { TableEditorStoreState } from "@/models/tableEditor/TableEditorStoreState";
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
import { TableEditorHookMap } from "@/services/tableEditor/TableEditorHookMap";
import { useItemStore } from "@/store/tableEditor/item";
import { MAX_READ_LIMIT, toRawDeep } from "@esposter/shared";

const id = "tableEditor";
const useBaseTableEditorStore = defineStore<typeof id, TableEditorStoreState>(id, () => {
  const { $trpc } = useNuxtApp();
  const itemStore = useItemStore();
  const { createItem, deleteItem, updateItem } = itemStore;
  const searchQuery = ref("");
  const {
    content: tableEditorConfiguration,
    createResource,
    currentResource,
    deleteResource,
    load,
    loadLocal,
    renameResource,
    resources,
    save: saveTableEditorConfiguration,
    selectResource,
    setCurrentResource,
  } = useResourceState(
    TableEditorConfiguration,
    {
      createResource: (input) => $trpc.tableEditor.createResource.mutate(input),
      deleteResource: (input) => $trpc.tableEditor.deleteResource.mutate(input),
      readResourceContent: (input) => $trpc.tableEditor.readResourceContent.query(input),
      readResources: async () => (await $trpc.tableEditor.readResources.query({ limit: MAX_READ_LIMIT })).items,
      saveResourceContent: (input) => $trpc.tableEditor.saveResourceContent.mutate(input),
      updateResource: (input) => $trpc.tableEditor.updateResource.mutate(input),
    },
    {
      defaultName: "My Tables",
      localStorageKey: TABLE_EDITOR_LOCAL_STORAGE_KEY,
      schema: tableEditorConfigurationSchema,
    },
  );
  const tableEditorType = ref(TableEditorType.TodoList);
  const tableEditor = computed(() => tableEditorConfiguration.value[tableEditorType.value]);
  const { editedIndex, editedItem, editFormDialog, ...rest } = createEditFormData(
    computed(() => tableEditor.value.items as Item[]),
    ["id"],
  );

  watch(
    editFormDialog,
    async (newEditFormDialog) => {
      if (newEditFormDialog) return;
      await Promise.all(TableEditorHookMap.Close.map((fn) => Promise.resolve(fn())));
    },
    { flush: "sync" },
  );

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
    createResource,
    currentResource,
    deleteResource,
    editedIndex,
    editedItem,
    editFormDialog,
    load,
    loadLocal,
    renameResource,
    resources,
    searchQuery,
    selectResource,
    setCurrentResource,
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
