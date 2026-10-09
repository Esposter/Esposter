// Animals run on the enemies' fixed step, so their motion is the same at any frame rate
export const WILDLIFE_STEP_SECONDS = 1 / 60;
// Provisional: how near the character an idle animal notices it and runs, and how long a flight lasts, in metres and
// Seconds. The environment table holds no bird's or beast's row, so the closest rows it does hold, its gadget rows' radius
// Of four and time of one second, stand in until a recording of each kind's flight measures them
export const WILDLIFE_ESCAPE_RADIUS = 4;
export const WILDLIFE_ESCAPE_SECONDS = 1;
// Provisional: no table gives a flight's speed, so it is a placeholder until a recording of each kind's flight times it
export const WILDLIFE_FLEE_SPEED = 6;
// The capsule each animal is drawn as until its model lands, and how many one draw holds
export const WILDLIFE_CAPSULE_RADIUS = 0.15;
export const WILDLIFE_CAPSULE_HEIGHT = 0.4;
export const WILDLIFE_CAPACITY = 256;
export const WILDLIFE_COLOR = "#e8d9a8";
