import type { TableEditorType } from "#shared/models/tableEditor/data/TableEditorType";

import { prettify } from "@/util/text/prettify";

export const getTableEditorTitle = (tableEditorType: TableEditorType) => `${prettify(tableEditorType)} Table Editor`;
