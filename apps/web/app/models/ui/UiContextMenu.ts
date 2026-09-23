import type { Item } from "@/models/shared/Item";

// The one context menu open: the items of the element that opened it, the point it opens at, and that element, which
// Takes focus back when it closes
export interface UiContextMenu {
  items: Item[];
  // Which target it belongs to, so that target can show itself as the one the menu is about
  key: string;
  opener: HTMLElement;
  x: number;
  y: number;
}
