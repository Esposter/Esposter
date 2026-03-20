import type { BooleanFilterValue } from "@/models/tableEditor/file/column/BooleanFilterValue";
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

export const BooleanFilterValueItemCategoryDefinitions: SelectItemCategoryDefinition<BooleanFilterValue>[] = [
  { title: "All", value: "" },
  { title: "True", value: "true" },
  { title: "False", value: "false" },
  { title: "Null", value: "null" },
];
