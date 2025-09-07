import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";
import type { Except } from "type-fest";

import { TableEditorType } from "#shared/models/tableEditor/data/TableEditorType";
import { parseDictionaryToArray } from "#shared/util/parseDictionaryToArray";
import { getTableEditorTitle } from "@/services/tableEditor/getTableEditorTitle";

const TableEditorTypeItemCategoryDefinitionMap = {
  [TableEditorType.TodoList]: {
    title: getTableEditorTitle(TableEditorType.TodoList),
  },
  [TableEditorType.VuetifyComponent]: {
    title: getTableEditorTitle(TableEditorType.VuetifyComponent),
  },
} as const satisfies Record<TableEditorType, Except<SelectItemCategoryDefinition<TableEditorType>, "value">>;

export const TableEditorTypeItemCategoryDefinitions: SelectItemCategoryDefinition<TableEditorType>[] =
  parseDictionaryToArray(TableEditorTypeItemCategoryDefinitionMap, "value");
