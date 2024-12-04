import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";
import type { Except } from "type-fest";

import { TableEditorType } from "#shared/models/tableEditor/TableEditorType";
import { getTableEditorTitle } from "@/services/tableEditor/getTableEditorTitle";
import { parseDictionaryToArray } from "@/util/parseDictionaryToArray";

const TableEditorTypeItemCategoryDefinitionMap = {
  [TableEditorType.TodoList]: {
    title: getTableEditorTitle(TableEditorType.TodoList),
  },
  [TableEditorType.VuetifyComponent]: {
    title: getTableEditorTitle(TableEditorType.VuetifyComponent),
  },
} as const satisfies Record<TableEditorType, Except<SelectItemCategoryDefinition<TableEditorType>, "value">>;

export const tableEditorTypeItemCategoryDefinitions: SelectItemCategoryDefinition<TableEditorType>[] =
  parseDictionaryToArray(TableEditorTypeItemCategoryDefinitionMap, "value");
