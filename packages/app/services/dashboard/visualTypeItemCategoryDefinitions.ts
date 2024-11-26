import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";
import type { Except } from "type-fest";

import { VisualType } from "@/shared/models/dashboard/data/VisualType";
import { parseDictionaryToArray } from "@/util/parseDictionaryToArray";
import { prettify } from "@/util/text/prettify";

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
).map((d) => ({ ...d, title: prettify(d.value) }));
