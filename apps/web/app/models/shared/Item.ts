import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import type { Promisable } from "type-fest";
// An action a menu or a list shows. Its icon is what it says, drawn in the nearest style's glyph, or a whole class for
// A glyph no meaning names. Every row leads with one, so a menu's titles line up and each reads at a glance
export type Item = {
  [key: string]: unknown;
  active?: boolean;
  badges?: { count: number; icon: string }[];
  disabled?: boolean;
  // Drawn in the error colour, for an action that destroys what it acts on
  isDanger?: true;
  // Opens a divider-separated group in renderings that draw them; a flat menu ignores it
  isGroupStart?: boolean;
  loading?: boolean;
  onClick?: (event: KeyboardEvent | MouseEvent) => Promisable<void>;
  shortTitle?: string;
  title: string;
} & ({ icon: string; meaning?: never } | { icon?: never; meaning: UiIconMeaning });
