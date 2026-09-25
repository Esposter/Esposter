// One choice in a menu, a select, a field's suggestions or a row of tabs: what it reads as, what choosing it gives,
// And a line saying more
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";

export interface UiMenuItem<T extends number | string> {
  description?: string;
  // An icon class written whole, drawn before the title
  icon?: string;
  // A picture drawn in the icon's place, or the title's first letter when it is empty: a room's
  image?: string;
  // Drawn in the error colour, for an item that destroys what it acts on
  isDanger?: boolean;
  // Still reached by the arrows, as the menu pattern keeps a disabled item, but never picked: an act already under way
  isDisabled?: boolean;
  // Opens a group, drawn after a separator
  isGroupStart?: boolean;
  // The member of a group of choices the reader has now — a theme mode, a design style — which makes each of the
  // Group's items a radio, marked at its end while chosen, so the reader sees every choice there is before picking
  isSelected?: boolean;
  // What the icon says, drawn in the nearest style's glyph in place of `icon`
  meaning?: UiIconMeaning;
  title: string;
  value: T;
}
