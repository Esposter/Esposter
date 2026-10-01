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
export const LOGIN_CAMERA_HEIGHT = walkway.top + EYE_HEIGHT;
export const LOGIN_CAMERA_Z = LOGIN_DOOR_POSITION[2] - 10.68;
export const LOGIN_CAMERA_YAW = Math.PI;
export const LOGIN_CAMERA_PITCH = (5.29 * Math.PI) / 180;
export const LOGIN_CAMERA_FOV = 51.2;
export const LOGIN_CAMERA_FAR = 2000;
// The rows MonoLoginScene scrolls past the camera, each laid ahead of its own place and wrapped by its length: the
// Walkway's copies, its own length apart, and the towers' with their bridges and pillars
export const LOGIN_WALKWAY_ROW = scroll.LoginScene_Bridge01_Vo;
export const LOGIN_TOWERS_ROW = scroll.LoginScene_Build_All;
// The cloud sea's row, the sea of cloud effect's two copies 300 metres apart (MonoLoginScene's third record)
export const LOGIN_CLOUD_SEA_ROW = { count: 2, length: 300 };
// The glide, in metres a second off the English recording's paving at the camera's pose (genshin:parity glide): 3.03
// While the title waits, steady to a few hundredths over its clean frames, about 3.7 once the game prepares, and
// Slowing by 0.55 each second toward the door, the slope of its last three seconds, to a stop there, the walkway's
// Copy the door stands on brought to rest where the camera's pose has it
export const LOGIN_GLIDE_TITLE_SPEED = 3.03;
export const LOGIN_GLIDE_PREPARING_SPEED = 3.7;
export const LOGIN_GLIDE_ACCELERATION = 0.55;
// The moment of the loop the title opens at, as metres scrolled: where the dawn frame's first solve stood the walkway,
// 10.4 metres short of the middle of the copy ahead, the stills' own pose still open
export const LOGIN_GLIDE_TITLE_SCROLLED = 8.67;
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
