import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";
import type { Except } from "type-fest";

import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { parseDictionaryToArray } from "#shared/util/parseDictionaryToArray";
import { prettify } from "@/util/text/prettify";

const VisualTypeItemCategoryDefinitionMap = Object.fromEntries(Object.values(VisualType).map((v) => [v, {}])) as Record<
  VisualType,
  Except<SelectItemCategoryDefinition<VisualType>, "title" | "value">
>;

export const visualTypeItemCategoryDefinitions: SelectItemCategoryDefinition<VisualType>[] = parseDictionaryToArray(
  VisualTypeItemCategoryDefinitionMap,
  "value",
).map((d) => Object.assign(d, { title: prettify(d.value) }));
