import door from "#src/data/login/door.json";

const [doorX = 0, doorY = 0, doorZ = 0] = door.position;
// Where the scene stands the door: the foot of its middle, sunk under the walkway's surface as its plinth is
export const LOGIN_DOOR_POSITION: [number, number, number] = [doorX, doorY, doorZ];
// The light the door opens with, from the English recording
export const LOGIN_DOOR_GLOW_COLOR = 0x8fe8ff;
// The door assembling itself as the door stage begins, each of its pieces rising into place along its own lift, the
// Last settled once this many milliseconds have passed
export const LOGIN_DOOR_LIFT_MS = (Math.max(...door.pieces.map(({ lift }) => lift.length - 1)) / door.liftRate) * 1000;
// The door's front relief drawn into its texture at so many pixels a metre, a pixel half a centimetre, as it was traced
export const LOGIN_DOOR_RELIEF_PIXELS_PER_METRE = 200;
// The door's light: a line down its middle this many metres to its half width, over a glow across the whole panel
export const LOGIN_DOOR_SLIT_WIDTH = 0.04;
export const LOGIN_DOOR_SLIT_STRENGTH = 4;
export const LOGIN_DOOR_PANEL_STRENGTH = 0.6;
