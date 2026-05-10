import type { Item } from "#shared/models/tableEditor/data/Item";
import type { TableEditor } from "#shared/models/tableEditor/data/TableEditor";
import type { ToData } from "@esposter/shared";
import type { z } from "zod";

import { createTableEditorSchema } from "#shared/models/tableEditor/data/TableEditor";
import { TableEditorType } from "#shared/models/tableEditor/data/TableEditorType";
import { TableEditorTypeItemSchemaMap } from "@/services/tableEditor/TableEditorTypeItemSchemaMap";

export const TableEditorTypeTableEditorSchemaMap = {
  [TableEditorType.File]: createTableEditorSchema(TableEditorTypeItemSchemaMap[TableEditorType.File]),
  [TableEditorType.TodoList]: createTableEditorSchema(TableEditorTypeItemSchemaMap[TableEditorType.TodoList]),
  [TableEditorType.VuetifyComponent]: createTableEditorSchema(
    TableEditorTypeItemSchemaMap[TableEditorType.VuetifyComponent],
  ),
} as const satisfies Record<TableEditorType, z.ZodType<ToData<TableEditor<Item>>>>;
