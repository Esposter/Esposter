import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { BooleanFilterValue } from "@/models/resource/sheet/column/BooleanFilterValue";

export const BooleanFilterValueItemCategoryDefinitions: SelectItemCategoryDefinition<BooleanFilterValue>[] = [
  { title: "All", value: "" },
  { title: "True", value: BooleanFilterValue.True },
  { title: "False", value: BooleanFilterValue.False },
  { title: "Null", value: BooleanFilterValue.Null },
];
