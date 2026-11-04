import type { UiSelectItem } from "@/models/ui/UiSelectItem";

import { VisualType, VisualTypes } from "#shared/models/dashboard/data/VisualType";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { prettify } from "@/util/text/prettify";

// A card and a table lead the picker, since the enum is sorted and would otherwise list them among the rest
const leadingVisualTypes = [VisualType.Card, VisualType.Table];
// Every chart type is offered and none overrides its title, so the enum's order is the item list after the leading two.
// A group lays out other visuals rather than drawing one, so it is in VisualTypeCategoryDefinitions instead
export const VisualTypeItemCategoryDefinitions: UiSelectItem<VisualType>[] = [
  ...leadingVisualTypes,
  ...[...VisualTypes].filter(
    (visualType) => !leadingVisualTypes.includes(visualType) && visualType !== VisualType.Group,
  ),
].map((visualType) => ({ meaning: UiIconMeaning.Chart, title: prettify(visualType), value: visualType }));
