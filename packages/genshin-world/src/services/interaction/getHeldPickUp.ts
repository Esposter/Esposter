import type { Interactable } from "#src/models/interaction/Interactable";
import type { InteractionPrompts } from "#src/models/interaction/InteractionPrompts";

import { InteractionKind } from "genshin-interface";

// What each repeat of a held F picks up: the selected row when it is an item, else the first item in the list. A repeat
// Never opens, talks, reads or activates, since each of those leaves the world for a screen
export const getHeldPickUp = ({ interactables, selectedId }: InteractionPrompts): Interactable | undefined =>
  interactables.find(({ id, kind }) => id === selectedId && kind === InteractionKind.PickUp) ??
  interactables.find(({ kind }) => kind === InteractionKind.PickUp);
