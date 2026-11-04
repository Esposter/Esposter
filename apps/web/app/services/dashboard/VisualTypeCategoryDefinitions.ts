import type { UiSelectItem } from "@/models/ui/UiSelectItem";

import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { VisualTypeItemCategoryDefinitions } from "@/services/dashboard/VisualTypeItemCategoryDefinitions";
import { prettify } from "@/util/text/prettify";

// The types a palette offers, by category: the charts, then the layout types that hold other visuals
export const VisualTypeCategoryDefinitions: { items: UiSelectItem<VisualType>[]; title: string }[] = [
  { items: VisualTypeItemCategoryDefinitions, title: "Charts" },
  {
    items: [{ meaning: UiIconMeaning.Group, title: prettify(VisualType.Group), value: VisualType.Group }],
    title: "Layout",
  },
];
