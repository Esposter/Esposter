import type { UiSelectItem } from "@/models/ui/UiSelectItem";

import { BooleanFilterValue } from "@/models/resource/sheet/column/BooleanFilterValue";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

export const BooleanFilterValueItemCategoryDefinitions: UiSelectItem<BooleanFilterValue>[] = [
  { meaning: UiIconMeaning.Filter, title: "All", value: "" },
  { meaning: UiIconMeaning.Success, title: "True", value: BooleanFilterValue.True },
  { meaning: UiIconMeaning.Close, title: "False", value: BooleanFilterValue.False },
  { meaning: UiIconMeaning.None, title: "Null", value: BooleanFilterValue.Null },
];
