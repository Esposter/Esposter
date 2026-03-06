import type { ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import type { Except } from "type-fest";

import { CsvColumn } from "#shared/models/tableEditor/file/CsvColumn";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { parseDictionaryToArray } from "#shared/util/parseDictionaryToArray";
import { prettify } from "@/util/text/prettify";
import { ItemEntityTypePropertyNames } from "@esposter/shared";

const DataSourceItemTypeItemCategoryDefinitionMap = {
  [ColumnType.Boolean]: {
    create: () => new CsvColumn({ type: ColumnType.Boolean }),
    icon: "mdi-toggle-switch",
    targetTypeKey: ItemEntityTypePropertyNames.type,
    title: prettify(ColumnType.Boolean),
  },
  [ColumnType.Date]: {
    create: () => new CsvColumn({ type: ColumnType.Date }),
    icon: "mdi-calendar",
    targetTypeKey: ItemEntityTypePropertyNames.type,
    title: prettify(ColumnType.Date),
  },
  [ColumnType.Number]: {
    create: () => new CsvColumn({ type: ColumnType.Number }),
    icon: "mdi-numeric",
    targetTypeKey: ItemEntityTypePropertyNames.type,
    title: prettify(ColumnType.Number),
  },
  [ColumnType.String]: {
    create: () => new CsvColumn({ type: ColumnType.String }),
    icon: "mdi-format-text",
    targetTypeKey: ItemEntityTypePropertyNames.type,
    title: prettify(ColumnType.String),
  },
} as const satisfies Record<ColumnType, Except<ItemCategoryDefinition<CsvColumn>, "value">>;

export const DataSourceItemTypeItemCategoryDefinitions: ItemCategoryDefinition<CsvColumn>[] =
  parseDictionaryToArray(DataSourceItemTypeItemCategoryDefinitionMap, "value");
