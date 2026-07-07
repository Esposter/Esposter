import type { EntityIdKeys } from "#shared/models/entity/EntityIdKeys";
import type { Item } from "#shared/models/tableEditor/data/Item";
import type { TableEditor } from "#shared/models/tableEditor/data/TableEditor";
import type { TableEditorConfiguration } from "#shared/models/tableEditor/data/TableEditorConfiguration";
import type { TableEditorType } from "#shared/models/tableEditor/data/TableEditorType";
import type { createEditFormData } from "@/services/shared/editForm/createEditFormData";
import type { Resource } from "@esposter/db-schema";
import type { ToData } from "@esposter/shared";

export type TableEditorStoreState<
  TItem extends ToData<Item> = ToData<Item>,
  TIdKeys extends EntityIdKeys<TItem> = EntityIdKeys<TItem>,
> = ReturnType<typeof createEditFormData<TItem, TIdKeys>> & {
  createResource: (name: Resource["name"]) => Promise<void>;
  currentResource: Ref<Resource | undefined>;
  deleteResource: (id: Resource["id"]) => Promise<void>;
  importConfiguration: (data: Partial<TableEditor<ToData<Item>>>) => Promise<void>;
  load: () => Promise<void>;
  loadLocal: () => void;
  renameResource: (id: Resource["id"], name: Resource["name"]) => Promise<void>;
  resources: Ref<Resource[]>;
  save: (isDeleteAction?: true) => Promise<void>;
  searchQuery: Ref<string>;
  selectResource: (id: Resource["id"]) => Promise<void>;
  setCurrentResource: (resource: Resource) => void;
  tableEditor: ComputedRef<TableEditor<TItem>>;
  tableEditorConfiguration: Ref<TableEditorConfiguration>;
  tableEditorType: Ref<TableEditorType>;
};
