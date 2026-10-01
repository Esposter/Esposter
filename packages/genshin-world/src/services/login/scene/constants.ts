import type { GradeOptions, RampOptions } from "genshin-engine";

import scroll from "#src/data/login/scroll.json";
import walkway from "#src/data/login/walkway.json";
import { LOGIN_DOOR_POSITION } from "#src/services/login/door/constants";

// The camera holds one pose while the world glides toward it, straight down the walkway's middle along +z (a heading
// Of half a turn, as ModelCamera turns), in the scene's own units, SceneObj's tenth: the pose login-door-recording
// Solves to on the walkway's and the door's silhouettes, the eye 1.24 metres over the walkway's top and 10.68 short of
// The door, pitched 5.3 degrees up under a vertical field of view of 51.2, which the glide's frames refine to as well
// (Login/Scene/Index.reference.ts's findings)
const EYE_HEIGHT = 1.24;
export const LOGIN_DOOR_REST_DISTANCE = 10.68;
export const LOGIN_CAMERA_HEIGHT = walkway.top + EYE_HEIGHT;
export const LOGIN_CAMERA_Z = LOGIN_DOOR_POSITION[2] - LOGIN_DOOR_REST_DISTANCE;
export const LOGIN_CAMERA_YAW = Math.PI;
export const LOGIN_CAMERA_PITCH = (5.29 * Math.PI) / 180;
export const LOGIN_CAMERA_FOV = 51.2;
export const LOGIN_CAMERA_FAR = 2000;
// The rows MonoLoginScene scrolls past the camera, each laid ahead of its own place and wrapped by its length: the
// Walkway's copies, its own length apart, and the towers' with their bridges and pillars
export const LOGIN_WALKWAY_ROW = scroll.LoginScene_Bridge01_Vo;
export const LOGIN_TOWERS_ROW = scroll.LoginScene_Build_All;
// Where the towers' row, its bridges and pillars with it, stands off the place the blocks lay it, the camera held at
// The door frame's pose: lowered 5 metres, the colonnade behind the door lands on login-door-recording's rows
// (genshin:parity view --offsets at 0, 5, 10 and 14) and the lantern tower's window band and gold rings on its own,
// And the deck of the bridge that crosses the glide's path passes under the walkway, as the game's glide passes over
// It however long the title idles; 2.47 metres toward -x and 8.94 nearer, the lantern tower's two edges land on the
// Recording's (genshin:parity place --landmarks towerRightInner,towerRightOuter --axes x,z), the crowned column behind
// The door within 20 pixels and the colonnade where it stood. Laid where the blocks lay it, the glide drove into the
// Bridge, and the lantern tower stood a ring too high and a third too narrow
export const LOGIN_TOWERS_ROW_OFFSET: [number, number, number] = [-2.47, -5, -8.94];
// The cloud sea's row, the sea of cloud effect's two copies 300 metres apart (MonoLoginScene's third record)
export const LOGIN_CLOUD_SEA_ROW = { count: 2, length: 300 };
// The glide, in metres a second off the English recording's paving at the camera's pose (genshin:parity glide): 3.03
// While the title waits, steady to a few hundredths over its clean frames, about 3.7 once the game prepares, and
// Slowing by 0.55 each second toward the door, the slope of its last three seconds, to a stop there, the walkway's
// Copy the door stands on brought to rest where the camera's pose has it
export const LOGIN_GLIDE_TITLE_SPEED = 3.03;
export const LOGIN_GLIDE_PREPARING_SPEED = 3.7;
export const LOGIN_GLIDE_ACCELERATION = 0.55;
// Where the glide comes to rest at the door, as metres scrolled: nine of the walkway's copies, the towers' row 144
// Metres along its loop, as both door references place it (genshin:parity place, their towers and bridges moved as one
// With the camera held: 145.8 and 144.4 along, their other axes scattering either way). There the lantern tower stands
// Close to the door's right and the colonnade low behind it, as every recording's door frame shows them
export const LOGIN_GLIDE_DOOR_SCROLLED = 144;
// The moment of the loop the title opens at, as metres scrolled. Its walkway's phase is where the dawn frame's first
// Solve stood the walkway, 10.4 metres short of the middle of the copy ahead, the stills' own pose still open; its
// Towers' is the English recording's glide from the title to the door's rest short of the door's, about 49 metres (2.4
// Seconds of title, the load's stall at the preparing pace, its measured 9 to 14 seconds and the braking after), since
// Recordings idle as long or not show the same door frame
const TITLE_WALKWAY_PHASE = 8.67;
const RECORDED_GLIDE_TO_DOOR = 49;
export const LOGIN_GLIDE_TITLE_SCROLLED =
  TITLE_WALKWAY_PHASE +
  LOGIN_WALKWAY_ROW.length *
    Math.round((LOGIN_GLIDE_DOOR_SCROLLED - RECORDED_GLIDE_TO_DOOR - TITLE_WALKWAY_PHASE) / LOGIN_WALKWAY_ROW.length);
// The rush to the door on the click: the camera closes 41% of its distance to the door in its first 333 ms, gathering
// Speed with the square of the time, as the door grows about 1.7 times in the recording's last third of a second
// (Login/Scene/Index.reference.ts, source `recording`), and stops short of the door under the white
export const LOGIN_DOOR_RUSH_SHARE = 0.41;
export const LOGIN_DOOR_RUSH_MS = 333;
export const LOGIN_DOOR_RUSH_LIMIT = 0.9;
// The cloud sea's top, far under the walkway where the towers' feet vanish, and how far it reaches
export const LOGIN_CLOUD_SEA_HEIGHT = -20;
export const LOGIN_CLOUD_SEA_SIZE = 3000;
export const LOGIN_RIM_STRENGTH = 0.4;
export const LOGIN_RAMP_OPTIONS: RampOptions = { resolution: 64, softness: 0.1, terminator: 0.5 };
export const LOGIN_GRADE_OPTIONS: GradeOptions = {
  contrast: 1,
  highlightTint: [0, 0, 0],
  saturation: 1.05,
  shadowTint: [0, 0, 0.02],
  size: 32,
};
// The haze the cloud sea gives off, thickest under the walkway and thinning up past it, so what stands in it pales
// Downward and the far towers pale into the haze's colour: dense enough 5 metres under the walkway that the towers'
// Feet are white, and thin enough at the eye that a tower 125 metres out is still half seen
export const LOGIN_FOG_DENSITY = 0.016;
export const LOGIN_FOG_HEIGHT_FALLOFF = 0.12;
export const LOGIN_FOG_START_DISTANCE = 10;
// The day's haze at its base, about seven times the rest's, solved with its colour on the phone's door frame over the
// Parts' pixels banded by depth and angle (genshin:parity fog): its colour lands on the one read off the day still
export const LOGIN_DAY_FOG_DENSITY = 0.114;
// The haze's light scattered toward the sun, which bathes the sunward side of the dawn's and the dusk's frames: how
// Narrowly it gathers round the sun and how strongly, measured off the references
export const LOGIN_FOG_SCATTER_POWER = 2;
export const LOGIN_FOG_SCATTER_STRENGTH = 1;
export const LOGIN_LIGHT_DISTANCE = 125;
// The light's shadow map: its size, the half width of the square it covers about the camera's view, and its biases
export const LOGIN_SHADOW_MAP_SIZE = 2048;
export const LOGIN_SHADOW_EXTENT = 50;
export const LOGIN_SHADOW_BIAS = -0.0005;
export const LOGIN_SHADOW_NORMAL_BIAS = 0.0125;
export const LOGIN_CLOUD_COVERAGE = 0;
