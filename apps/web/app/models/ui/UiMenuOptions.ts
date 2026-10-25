import type { Promisable } from "type-fest";

export interface UiMenuOptions<T extends string> {
  onSelect: (value: T, event: KeyboardEvent | MouseEvent) => Promisable<void>;
  // What takes focus back as the menu closes: its trigger, or the element a context menu opened over
  returnFocusTo: () => HTMLElement | undefined;
}
