import { type TableEditorType } from "@/models/tableEditor/TableEditorType";
import { prettifyName } from "@/util/text";

export const getTableEditorTitle = (tableEditorType: TableEditorType) =>
  `${prettifyName(tableEditorType)} Table Editor`;
