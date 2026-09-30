import door from "#src/data/login/door.json";

const [doorWidth = 0, doorHeight = 0, doorDepth = 0] = door.size;
const [doorX = 0, doorY = 0, doorZ = 0] = door.position;
// Where the scene stands the door: the foot of its middle, sunk under the walkway's surface as its plinth is
export const LOGIN_DOOR_POSITION: [number, number, number] = [doorX, doorY, doorZ];
// The door's plinth, arch, border and recess as shares of its fitted size, read off the door capture: a round head a
// Fifth of its height, a border about a ninth of its width, a plinth under a twentieth of its height, and a panel
// Recessed a third of its depth
const PLINTH_SHARE = 0.047;
const ARCH_SHARE = 0.19;
const BORDER_SHARE = 0.115;
const RECESS_SHARE = 0.3;
const plinthHeight = doorHeight * PLINTH_SHARE;
export const LOGIN_DOOR = {
  archRise: doorHeight * ARCH_SHARE,
  border: doorWidth * BORDER_SHARE,
  depth: doorDepth,
  height: doorHeight - plinthHeight,
  plinthHeight,
  recess: doorDepth * RECESS_SHARE,
  width: doorWidth,
};
// The door's panel, a blue slate darker than its frame, and the light it opens with, from the English recording
export const LOGIN_DOOR_COLOR = 0x6f7a96;
export const LOGIN_DOOR_GLOW_COLOR = 0x8fe8ff;
