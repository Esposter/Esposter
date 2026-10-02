import door from "#src/data/login/door.json";

const [doorX = 0, doorY = 0, doorZ = 0] = door.position;
// Where the scene stands the door: the foot of its middle, sunk under the walkway's surface as its plinth is
export const LOGIN_DOOR_POSITION: [number, number, number] = [doorX, doorY, doorZ];
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
// The door's front relief drawn into its texture at so many pixels a metre, a pixel half a centimetre, as it was traced
export const LOGIN_DOOR_RELIEF_PIXELS_PER_METRE = 200;
// How far the relief's colours stand from the stone, as a share of how far its texels' do: drawn beside the game's own
// Exports on both door frames, the door scores best by FLIP and by structural similarity at three fifths, its panel's
// Bands lit across their carving in the game where ours are painted
export const LOGIN_DOOR_RELIEF_CONTRAST = 0.6;
