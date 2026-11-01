export const CHANNELS = 4;
export const COLOUR_CHANNELS = 3;
// A level whose longer side is at most this is solved outright, since a finer one only ever starts from its solution
export const COARSEST_SIDE = 8;
export const RELAX_SWEEP_LIMIT = 2000;
// A sweep whose largest change is under this, on the 0 to 255 scale, has settled the level
export const SETTLED_CHANGE = 0.01;
