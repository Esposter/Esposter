import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

// One option of a select that leads with a mark, as every row of a list does, and which the trigger shows while it is
// The chosen one: a whole icon class, a picture, or what its icon says. A select whose options carry no mark takes a
// Plain UiMenuItem instead
export type UiSelectItem<T extends string> = UiMenuItem<T> &
  ({ icon: string } | { image: string } | { meaning: UiIconMeaning });
