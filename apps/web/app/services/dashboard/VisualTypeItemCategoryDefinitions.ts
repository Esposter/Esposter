import type { VisualType } from "#shared/models/dashboard/data/VisualType";
import type { UiSelectItem } from "@/models/ui/UiSelectItem";

import { VisualTypes } from "#shared/models/dashboard/data/VisualType";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { prettify } from "@/util/text/prettify";

// Every visual type is offered and none overrides its title, so the enum itself is the item list
export const VisualTypeItemCategoryDefinitions: UiSelectItem<VisualType>[] = Array.from(VisualTypes, (visualType) => ({
  meaning: UiIconMeaning.Chart,
  title: prettify(visualType),
  value: visualType,
}));
