import type { GenshinExitCheckState } from "#src/models/genshinProgress/GenshinExitCheckState";

// One exit check of a phase: its name, its state, and the notes under it, which name the items a not met check fails on
// Or say why a check is not measurable
export interface GenshinExitCheck {
  name: string;
  notes: string[];
  state: GenshinExitCheckState;
}
