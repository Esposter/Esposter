import type { BooleanFilterValue } from "@/models/resource/sheet/column/BooleanFilterValue";
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { BooleanValue } from "#shared/models/resource/sheet/column/BooleanValue";
import { NULL_BOOLEAN_FILTER_VALUE } from "@/services/resource/sheet/constants";

export const BooleanFilterValueItemCategoryDefinitions: SelectItemCategoryDefinition<BooleanFilterValue>[] = [
  { title: "All", value: "" },
  { title: "True", value: BooleanValue.True },
  { title: "False", value: BooleanValue.False },
  { title: "Null", value: NULL_BOOLEAN_FILTER_VALUE },
];
