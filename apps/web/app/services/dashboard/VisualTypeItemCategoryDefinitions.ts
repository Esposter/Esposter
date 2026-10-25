import type { UiSelectItem } from "@/models/ui/UiSelectItem";

import { VisualType, VisualTypes } from "#shared/models/dashboard/data/VisualType";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { prettify } from "@/util/text/prettify";

// A card and a table lead the picker, since the enum is sorted and would otherwise list them among the rest
const leadingVisualTypes = [VisualType.Card, VisualType.Table];
// Every visual type is offered and none overrides its title, so the enum's order is the item list after the leading two
export const VisualTypeItemCategoryDefinitions: UiSelectItem<VisualType>[] = [
  ...leadingVisualTypes,
  ...[...VisualTypes].filter((visualType) => !leadingVisualTypes.includes(visualType)),
].map((visualType) => ({ meaning: UiIconMeaning.Chart, title: prettify(visualType), value: visualType }));
