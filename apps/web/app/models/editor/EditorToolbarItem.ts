import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import type { Promisable } from "type-fest";

// One tool, toggle or command a toolbar draws: its mark and title, the shortcut its registered command carries, its
// Pressed state while it is a toggle, and the reason it cannot be used. A tool with variants is one slot holding them,
// Each its own choice. A value is unique within its toolbar, since it keys the item and names the choice it makes
export interface EditorToolbarItem {
  // The reason it cannot be used, which the item says as its description
  description?: string;
  isDisabled?: boolean;
  // Kept in the bar when the toolbar folds what does not fit, rather than moved into its overflow menu
  isPinned?: boolean;
  // Set on a toggle, and drawn pressed while it is on
  isPressed?: boolean;
  meaning: UiIconMeaning;
  // What a command does when it is run; a tool is chosen rather than run, so it has none
  onClick?: () => Promisable<void>;
  // In Vuetify 0's hotkey syntax, as the command it runs carries it
  shortcut?: string;
  title: string;
  value: string;
  // The variants of a tool, which share its one slot: the variant last used is the one the slot draws
  variants?: EditorToolbarItem[];
}
