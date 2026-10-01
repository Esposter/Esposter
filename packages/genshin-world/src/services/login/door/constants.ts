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
// The light the door opens with, from the English recording
export const LOGIN_DOOR_GLOW_COLOR = 0x8fe8ff;
// The door assembling itself as the door stage begins: its main piece rises 50 metres of its own space, 5 at
// SceneObj's tenth, from below into place, the share of the rise done at each time in milliseconds sampled from
// Ani_LogginScene_Door01_Liftting (Login/Scene/Index.reference.ts, source `doorRise`), easing out and settled by 800
export const LOGIN_DOOR_RISE_DEPTH = 5;
export const LOGIN_DOOR_RISE_KEYFRAMES: [number, number][] = [
  [0, 0],
  [133, 0.253],
  [267, 0.514],
  [400, 0.746],
  [533, 0.899],
  [667, 0.974],
  [800, 1],
];
