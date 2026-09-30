import type { ParityMotion } from "#src/models/genshinParity/ParityMotion";

export interface ShootOptions {
  // An image drawn behind the screen, for an overlay shot over the very frame it is judged against
  backdropPath?: string;
  height: number;
  // The motion held at each of `timesMs`: the screen's entry, or its fixture's motion props
  motion?: ParityMotion;
  // Props over the fixture's, as JSON the page reads
  props?: Record<string, unknown>;
  screen: string;
  // The moments to hold the motion at and shoot, in milliseconds; none shoots the fixture's first state
  timesMs?: number[];
  width: number;
}
