import type { EntityIdKeys } from "#shared/models/entity/EntityIdKeys";
import type { Item } from "#shared/models/tableEditor/data/Item";
import type { TableEditor } from "#shared/models/tableEditor/data/TableEditor";
import type { TableEditorConfiguration } from "#shared/models/tableEditor/data/TableEditorConfiguration";
import type { TableEditorType } from "#shared/models/tableEditor/data/TableEditorType";
import type { createEditFormData } from "@/services/shared/editForm/createEditFormData";
import type { Document } from "@esposter/db-schema";
import type { ToData } from "@esposter/shared";

export type TableEditorStoreState<
  TItem extends ToData<Item> = ToData<Item>,
  TIdKeys extends EntityIdKeys<TItem> = EntityIdKeys<TItem>,
> = ReturnType<typeof createEditFormData<TItem, TIdKeys>> & {
  createDocument: (name: Document["name"]) => Promise<void>;
  currentDocument: Ref<Document | undefined>;
  deleteDocument: (id: Document["id"]) => Promise<void>;
  documents: Ref<Document[]>;
  importConfiguration: (data: Partial<TableEditor<ToData<Item>>>) => Promise<void>;
  load: () => Promise<void>;
  loadLocal: () => void;
  renameDocument: (id: Document["id"], name: Document["name"]) => Promise<void>;
  save: (isDeleteAction?: true) => Promise<void>;
  searchQuery: Ref<string>;
  selectDocument: (id: Document["id"]) => Promise<void>;
  setCurrentDocument: (document: Document) => void;
  tableEditor: ComputedRef<TableEditor<TItem>>;
  tableEditorConfiguration: Ref<TableEditorConfiguration>;
  tableEditorType: Ref<TableEditorType>;
};
