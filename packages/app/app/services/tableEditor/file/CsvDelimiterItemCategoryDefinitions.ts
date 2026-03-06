import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";
import type { Except } from "type-fest";

import { CsvDelimiter } from "#shared/models/tableEditor/file/CsvDelimiter";
import { parseDictionaryToArray } from "#shared/util/parseDictionaryToArray";

const CsvDelimiterItemCategoryDefinitionMap = {
  [CsvDelimiter.Comma]: { title: "Comma (,)" },
  [CsvDelimiter.Pipe]: { title: "Pipe (|)" },
  [CsvDelimiter.Semicolon]: { title: "Semicolon (;)" },
  [CsvDelimiter.Tab]: { title: "Tab" },
} as const satisfies Record<CsvDelimiter, Except<SelectItemCategoryDefinition<CsvDelimiter>, "value">>;

export const CsvDelimiterItemCategoryDefinitions: SelectItemCategoryDefinition<CsvDelimiter>[] =
  parseDictionaryToArray(CsvDelimiterItemCategoryDefinitionMap, "value");
