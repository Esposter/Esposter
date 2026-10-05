import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import type { RouteLocationRaw } from "vue-router";

// One row of a list: somewhere to go, something to do, or a choice. Every row leads with a mark — what its icon says,
// Drawn in the nearest style's glyph, a whole class for a glyph no meaning names, or a picture, which is the title's
// First letter while it is empty: a room's, a friend's — or whatever the list's mark slot draws for it, a role's
// Colour. A mark that is a control of its own, a todo's checkbox, is the list's leading slot, drawn beside the row in
// The mark's column since a row that is one button holds nothing interactive
export type UiListItem<T extends string> = {
  description?: string;
  // What it is listed under, drawn as the heading over the rows beside it that share it
  group?: string;
  // The row for where the reader is — the current page's link, or the panel a sidebar shows — which a list that
  // Holds a selection never reads
  isCurrent?: boolean;
  // Drawn in the error colour, title and mark, for a row that destroys what it acts on, as a menu's danger item is
  isDanger?: true;
  title: string;
  // Where the row goes. A row with one is a real link, so it opens in a new tab like any other
  to?: RouteLocationRaw;
  value: T;
} & (
  | { hasLeadingSlot: true; hasMarkSlot?: never; icon?: never; image?: never; meaning?: never }
  | { hasLeadingSlot?: never; hasMarkSlot: true; icon?: never; image?: never; meaning?: never }
  | { hasLeadingSlot?: never; hasMarkSlot?: never; icon: string; image?: never; meaning?: never }
  | { hasLeadingSlot?: never; hasMarkSlot?: never; icon?: never; image: string; meaning?: never }
  | { hasLeadingSlot?: never; hasMarkSlot?: never; icon?: never; image?: never; meaning: UiIconMeaning }
);
