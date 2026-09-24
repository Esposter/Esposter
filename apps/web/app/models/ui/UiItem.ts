import type { Item } from "@/models/shared/Item";
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import type { Except } from "type-fest";
// An action a library menu shows: an `Item` whose icon is what it says, drawn in the nearest style's glyph, or a whole
// Class for a glyph no meaning names. Every `Item` is one, so a list Vuetify still draws passes straight through
// @TODO: retirement folds this into Item once nothing hands one to Vuetify (/docs/proposals/refactors/ui-library/retirement)
export interface UiItem extends Except<Item, "icon"> {
  icon?: string;
  meaning?: UiIconMeaning;
}
