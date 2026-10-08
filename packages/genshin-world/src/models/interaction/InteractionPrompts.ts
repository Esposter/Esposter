import type { Interactable } from "#src/models/interaction/Interactable";

// The prompts beside the character: every thing in reach as a row, nearest first, the selected thing's id, "" with no
// Row, and the first row of the window the list shows
export interface InteractionPrompts {
  interactables: Interactable[];
  selectedId: string;
  windowStart: number;
}
