import { VisualType } from "@/models/dashboard/VisualType";
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";
import { parseDictionaryToArray } from "@/util/parseDictionaryToArray";
import { prettifyName } from "@/util/text/prettifyName";
import type { Except } from "type-fest";

const VisualTypeItemCategoryDefinitionMap = {
  [VisualType.Area]: {},
  [VisualType.Bar]: {},
  [VisualType.Column]: {},
  [VisualType.Funnel]: {},
  [VisualType.Line]: {},
  [VisualType.RangeArea]: {},
  [VisualType.RangeBar]: {},
} as const satisfies Record<VisualType, Except<SelectItemCategoryDefinition<VisualType>, "title" | "value">>;

export const visualTypeItemCategoryDefinitions: SelectItemCategoryDefinition<VisualType>[] = parseDictionaryToArray(
  VisualTypeItemCategoryDefinitionMap,
  "value",
).map((d) => ({ ...d, title: prettifyName(d.value) }));
