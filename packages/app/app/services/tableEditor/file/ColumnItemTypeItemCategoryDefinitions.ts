import type { ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import type { Except } from "type-fest";

import { ColumnItem } from "#shared/models/tableEditor/file/ColumnItem";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { parseDictionaryToArray } from "#shared/util/parseDictionaryToArray";
import { prettify } from "@/util/text/prettify";
import { ItemEntityTypePropertyNames } from "@esposter/shared";

const ColumnItemTypeItemCategoryDefinitionMap = {
  [ColumnType.Boolean]: {
    create: () => new ColumnItem({ type: ColumnType.Boolean }),
    icon: "mdi-toggle-switch",
    targetTypeKey: ItemEntityTypePropertyNames.type,
    title: prettify(ColumnType.Boolean),
  },
  [ColumnType.Date]: {
    create: () => new ColumnItem({ type: ColumnType.Date }),
    icon: "mdi-calendar",
    targetTypeKey: ItemEntityTypePropertyNames.type,
    title: prettify(ColumnType.Date),
  },
  [ColumnType.Number]: {
    create: () => new ColumnItem({ type: ColumnType.Number }),
    icon: "mdi-numeric",
    targetTypeKey: ItemEntityTypePropertyNames.type,
    title: prettify(ColumnType.Number),
  },
  [ColumnType.String]: {
    create: () => new ColumnItem({ type: ColumnType.String }),
    icon: "mdi-format-text",
    targetTypeKey: ItemEntityTypePropertyNames.type,
    title: prettify(ColumnType.String),
  },
} as const satisfies Record<ColumnType, Except<ItemCategoryDefinition<ColumnItem>, "value">>;

export const ColumnItemTypeItemCategoryDefinitions: ItemCategoryDefinition<ColumnItem>[] = parseDictionaryToArray(
  ColumnItemTypeItemCategoryDefinitionMap,
  "value",
);
