import type { TableEditorType } from "@/models/tableEditor/TableEditorType";

import { prettify } from "@/util/text/prettify";

export const getTableEditorTitle = (tableEditorType: TableEditorType) => `${prettify(tableEditorType)} Table Editor`;
