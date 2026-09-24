import type { UiItem } from "@/models/ui/UiItem";

// The one context menu open: the items of the element that opened it, the point it opens at, and that element, which
// Takes focus back when it closes
export interface UiContextMenu {
  items: UiItem[];
  // Which target it belongs to, so that target can show itself as the one the menu is about
  key: string;
  opener: HTMLElement;
  x: number;
  y: number;
}
