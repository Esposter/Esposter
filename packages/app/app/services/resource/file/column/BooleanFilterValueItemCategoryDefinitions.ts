import type { BooleanFilterValue } from "@/models/resource/file/column/BooleanFilterValue";
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { BooleanValue } from "#shared/models/resource/file/column/BooleanValue";

export const BooleanFilterValueItemCategoryDefinitions: SelectItemCategoryDefinition<BooleanFilterValue>[] = [
  { title: "All", value: "" },
  { title: "True", value: BooleanValue.True },
  { title: "False", value: BooleanValue.False },
  { title: "Null", value: "null" },
];
