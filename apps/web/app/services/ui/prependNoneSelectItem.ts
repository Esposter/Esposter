import type { UiSelectItem } from "@/models/ui/UiSelectItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

// The empty choice a select leads with when its value may be none, so picking none is a choice of its own rather than an
// Absent value the select shows nothing for
export const prependNoneSelectItem = (items: UiSelectItem<string>[]): UiSelectItem<string>[] => [
  { meaning: UiIconMeaning.None, title: "None", value: "" },
  ...items,
];
