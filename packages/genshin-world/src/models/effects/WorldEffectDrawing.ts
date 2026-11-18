import type { WorldEffectKind } from "#src/models/effects/WorldEffectKind";

// A world effect as the overlay draws it: its place on the screen in percent, how far through its life it is, and the
// Number it shows, empty for a visual that shows none
export interface WorldEffectDrawing {
  kind: WorldEffectKind;
  left: number;
  progress: number;
  text: string;
  top: number;
}
