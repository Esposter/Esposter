import type { ScreenKind } from "#src/models/screen/ScreenKind";

// The wheel between two frames: whether it is open, the move it last saw held and the entry that move points at, and on
// The frame its key lets go, the screen of the entry it opens
export interface ShortcutWheelStep {
  isOpen: boolean;
  move: { x: number; y: number };
  openedScreenKind: ScreenKind | undefined;
  pickedIndex: number | undefined;
}
