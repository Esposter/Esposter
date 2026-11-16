import type { Drag } from "#src/models/ui/dragReorder/Drag";

export interface Press {
  container: HTMLElement;
  drag?: Drag | undefined;
  index: number;
  // A drag Escape cancelled while the pointer stays down, whose release still raises a click
  isCancelled: boolean;
  items: HTMLElement[];
  // Ends the listeners the press holds
  listeners: AbortController;
  observer?: MutationObserver | undefined;
  pointerId: number;
  pointerType: string;
  pointerY: number;
  reorder: (toIndex: number) => void;
  startX: number;
  startY: number;
}
