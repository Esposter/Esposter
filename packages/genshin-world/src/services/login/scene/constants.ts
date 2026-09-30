import type { GradeOptions, RampOptions } from "genshin-engine";

import walkway from "#src/data/login/walkway.json";
import { LOGIN_DOOR_POSITION } from "#src/services/login/door/constants";

// The flight's first pose, matched on the witness render: the game's own towers, bridges and walkway drawn through
// The scene from each pose of a search, their long vertical lines scored against the dawn, dusk and night skies, which
// Share one pose, then refined by a simplex (Login/Scene/Index.reference.ts's findings). The eye stands 18 metres over
// The walkway's top, turned 7.3 degrees off its line and pitched 3 degrees up, at a 42.8 degree vertical field of view
export const LOGIN_CAMERA_START: [number, number, number] = [-3.27, 12.99, 200.34];
export const LOGIN_CAMERA_YAW = (7.29 * Math.PI) / 180;
export const LOGIN_CAMERA_PITCH = (3.04 * Math.PI) / 180;
export const LOGIN_CAMERA_FOV = 42.76;
// The flight ends 3.93 of the eye's height over the walkway short of the door, where the door's foot meets the frame
// 0.722 down in the English recording's last pose, looking straight down the walkway: its offset and heading ease to
// None as it flies along -z
const DOOR_DISTANCE_SHARE = 3.93;
export const LOGIN_CAMERA_END_Z = LOGIN_DOOR_POSITION[2] + (LOGIN_CAMERA_START[1] - walkway.top) * DOOR_DISTANCE_SHARE;
export const LOGIN_CAMERA_FAR = 8000;
// The rush to the door on the click: the camera closes 41% of its distance to the door in its first 333 ms, gathering
// Speed with the square of the time, as the door grows about 1.7 times in the recording's last third of a second
// (Login/Scene/Index.reference.ts, source `recording`), and stops short of the door under the white
export const LOGIN_DOOR_RUSH_SHARE = 0.41;
export const LOGIN_DOOR_RUSH_MS = 333;
export const LOGIN_DOOR_RUSH_LIMIT = 0.9;
// The cloud sea's top, far under the walkway where the towers' feet vanish, and how far it reaches
export const LOGIN_CLOUD_SEA_HEIGHT = -80;
export const LOGIN_CLOUD_SEA_SIZE = 12_000;
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
// Downward and the far towers pale into the haze's colour: dense enough 20 metres under the walkway that the towers'
// Feet are white, and thin enough at the eye that a tower half a kilometre out is still half seen
export const LOGIN_FOG_DENSITY = 0.004;
export const LOGIN_FOG_HEIGHT_FALLOFF = 0.03;
export const LOGIN_FOG_START_DISTANCE = 40;
// The haze's light scattered toward the sun, which bathes the sunward side of the dawn's and the dusk's frames: how
// Narrowly it gathers round the sun and how strongly, measured off the references
export const LOGIN_FOG_SCATTER_POWER = 2;
export const LOGIN_FOG_SCATTER_STRENGTH = 1;
export const LOGIN_LIGHT_DISTANCE = 500;
// The light's shadow map: its size, the half width of the square it covers about the camera's view, and its biases
export const LOGIN_SHADOW_MAP_SIZE = 2048;
export const LOGIN_SHADOW_EXTENT = 200;
export const LOGIN_SHADOW_BIAS = -0.0005;
export const LOGIN_SHADOW_NORMAL_BIAS = 0.05;
export const LOGIN_CLOUD_COVERAGE = 0;
