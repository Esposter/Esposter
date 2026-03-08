import type { EntityIdKeys } from "#shared/models/entity/EntityIdKeys";
import type { Item } from "#shared/models/tableEditor/data/Item";
import type { TableEditor } from "#shared/models/tableEditor/data/TableEditor";
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
import { authClient } from "@/services/auth/authClient";
import { createEditFormData } from "@/services/shared/editForm/createEditFormData";
import { saveToLocalStorage } from "@/services/shared/localStorage/saveToLocalStorage";
import { saveItemMetadata } from "@/services/shared/metadata/saveItemMetadata";
import { TABLE_EDITOR_LOCAL_STORAGE_KEY } from "@/services/tableEditor/constants";
import { TableEditorTypeItemSchemaMap } from "@/services/tableEditor/TableEditorTypeItemSchemaMap";
import { useAlertStore } from "@/store/alert";
import { useItemStore } from "@/store/tableEditor/item";
import { toRawDeep } from "@esposter/shared";
import { z } from "zod";

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
  const alertStore = useAlertStore();
  const itemStore = useItemStore();
  const { createItem, deleteItem, updateItem } = itemStore;
  const searchQuery = ref("");
  const tableEditorConfiguration = ref(new TableEditorConfiguration());
  const tableEditorType = ref(TableEditorType.TodoList);
  const tableEditor = computed(() => tableEditorConfiguration.value[tableEditorType.value]);
  const { editedIndex, editedItem, editFormDialog, formError, ...rest } = createEditFormData(
    computed(() => tableEditor.value.items as Item[]),
    ["id"],
  );
  const save = async (isDeleteAction?: true) => {
    if (!editedItem.value) return;

    const snapshot = structuredClone(toRawDeep(tableEditorConfiguration.value));

    if (isDeleteAction) deleteItem({ id: editedItem.value.id });
    else if (editedIndex.value > -1) updateItem(editedItem.value);
    else createItem(editedItem.value);
    editFormDialog.value = false;

    if (session.value.data) {
      saveItemMetadata(tableEditorConfiguration.value);
      try {
        await $trpc.tableEditor.saveTableEditorConfiguration.mutate(tableEditorConfiguration.value);
      } catch {
        tableEditorConfiguration.value = new TableEditorConfiguration(snapshot);
        alertStore.createAlert("Failed to save. Your changes have been reverted.", "error");
      }
    } else {
      saveItemMetadata(tableEditorConfiguration.value);
      saveToLocalStorage(
        TABLE_EDITOR_LOCAL_STORAGE_KEY,
        tableEditorConfigurationSchema,
        tableEditorConfiguration.value,
      );
    }
  };

  watch(
    editedItem,
    (item) => {
      if (!item) {
        formError.value = "";
        return;
      }

      const schema = TableEditorTypeItemSchemaMap[tableEditorType.value];
      const result = schema.safeParse(toRaw(item));
      formError.value = result.success ? "" : z.prettifyError(result.error);
    },
    { deep: true, immediate: true },
  );

  return {
    editedIndex,
    editedItem,
    editFormDialog,
    formError,
    searchQuery,
    tableEditor,
    tableEditorConfiguration,
    tableEditorType,
    ...rest,
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
