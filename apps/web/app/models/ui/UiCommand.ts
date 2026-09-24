import type { Promisable } from "type-fest";
import type { RouteLocationRaw } from "vue-router";

// One thing the reader can do or reach: a page, an action, a search result, or a key a surface handles itself. The
// Palette offers what it can reach or run, and the shortcuts dialog lists what has a shortcut
export interface UiCommand {
  // A line after the title saying more: a docs page's headings, a resource's type
  description?: string;
  // What it is listed under, in the palette and in the shortcuts dialog: the surface that registered it
  group: string;
  // An icon class written whole, drawn before the title
  icon?: string;
  id: string;
  // A picture drawn in place of the icon, or the title's first letter when it is empty: a room's
  image?: string;
  // What choosing it does. Neither this nor `to` makes a key the surface handles itself, such as the composer's
  // Enter: listed with its shortcut, never offered or bound
  run?: () => Promisable<void>;
  // In Vuetify's hotkey syntax: a chord joined by "+", a sequence by "-"
  shortcut?: string;
  title: string;
  // Where choosing it goes. A row with one is a real link, so it opens in a new tab like any other
  to?: RouteLocationRaw;
}
