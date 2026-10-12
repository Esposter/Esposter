import type { ParityPageOptions } from "#src/models/genshinParity/shared/ParityPageOptions";

export interface ShootOptions extends ParityPageOptions {
  // The pixel the page's pointer rests at before a still is shot, so the piece under it is drawn lit
  pointer?: [number, number];
  // The moments to hold the motion at and shoot, in milliseconds; none shoots the fixture's first state
  timesMs?: number[];
}
