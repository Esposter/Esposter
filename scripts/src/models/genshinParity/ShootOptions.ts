import type { ParityPageOptions } from "#src/models/genshinParity/ParityPageOptions";

export interface ShootOptions extends ParityPageOptions {
  // The moments to hold the motion at and shoot, in milliseconds; none shoots the fixture's first state
  timesMs?: number[];
}
