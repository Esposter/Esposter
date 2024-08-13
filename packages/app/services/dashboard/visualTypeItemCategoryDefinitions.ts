import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";
import type { Except } from "type-fest";

import { VisualType } from "@/models/dashboard/VisualType";
import { parseDictionaryToArray } from "@/util/parseDictionaryToArray";
import { prettifyName } from "@/util/text/prettifyName";

const VisualTypeItemCategoryDefinitionMap = Object.values(VisualType).reduce(
  (acc, curr) => {
    acc[curr] = {};
    return acc;
  },
  {} as Record<VisualType, Except<SelectItemCategoryDefinition<VisualType>, "title" | "value">>,
);

export const visualTypeItemCategoryDefinitions: SelectItemCategoryDefinition<VisualType>[] = parseDictionaryToArray(
  VisualTypeItemCategoryDefinitionMap,
  "value",
).map((d) => ({ ...d, title: prettifyName(d.value) }));
