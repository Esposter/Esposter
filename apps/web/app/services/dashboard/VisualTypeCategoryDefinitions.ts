import type { UiSelectItem } from "@/models/ui/UiSelectItem";

import { VisualType, VisualTypes } from "#shared/models/dashboard/data/VisualType";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { prettify } from "@/util/text/prettify";

// A card and a table lead the charts, since the enum is sorted and would otherwise list them among the rest
const leadingVisualTypes = [VisualType.Card, VisualType.Table];
// Every chart type is offered and none overrides its title, so the enum's order follows the two leading types. A group
// Lays out other visuals rather than drawing one, so it is listed under Layout alone
const chartVisualTypes = [
  ...leadingVisualTypes,
  ...[...VisualTypes].filter(
    (visualType) => !leadingVisualTypes.includes(visualType) && visualType !== VisualType.Group,
  ),
];
// The types a palette offers, by category: the charts, then Layout holding the group
export const VisualTypeCategoryDefinitions: { items: UiSelectItem<VisualType>[]; title: string }[] = [
  {
    items: chartVisualTypes.map((visualType) => ({
      meaning: UiIconMeaning.Chart,
      title: prettify(visualType),
      value: visualType,
    })),
    title: "Charts",
  },
  {
    items: [{ meaning: UiIconMeaning.Group, title: prettify(VisualType.Group), value: VisualType.Group }],
    title: "Layout",
  },
];
