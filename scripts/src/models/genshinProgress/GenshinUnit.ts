import type { ComputeKind } from "#src/models/fleet/ComputeKind";
import type { GenshinProgressKind } from "#src/models/genshinProgress/GenshinProgressKind";
import type { GenshinUnitState } from "#src/models/genshinProgress/GenshinUnitState";

// One counted unit: its kind, the phase it holds (absent when none), its state, and the blocker it names when waiting
export interface GenshinUnit {
  blocker: string;
  kind: ComputeKind | GenshinProgressKind;
  phase?: number;
  state: GenshinUnitState;
}
