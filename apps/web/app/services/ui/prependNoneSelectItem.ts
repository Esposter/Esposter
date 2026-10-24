import type { UiSelectItem } from "@/models/ui/UiSelectItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

// The empty choice a select leads with when its value may be none, so picking none is a choice of its own rather than an
// Absent value the select shows nothing for. Its title says what none means where the list has its own word for it
export const prependNoneSelectItem = <T extends string>(
  items: UiSelectItem<T>[],
  title = "None",
): UiSelectItem<"" | T>[] => [{ meaning: UiIconMeaning.None, title, value: "" }, ...items];
