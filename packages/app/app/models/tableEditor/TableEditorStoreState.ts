import type { EntityIdKeys } from "#shared/models/entity/EntityIdKeys";
import type { Item } from "#shared/models/tableEditor/data/Item";
import type { TableEditor } from "#shared/models/tableEditor/data/TableEditor";
import type { TableEditorConfiguration } from "#shared/models/tableEditor/data/TableEditorConfiguration";
import type { TableEditorType } from "#shared/models/tableEditor/data/TableEditorType";
import type { createEditFormData } from "@/services/shared/editForm/createEditFormData";
import type { ToData } from "@esposter/shared";

export type TableEditorStoreState<
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
