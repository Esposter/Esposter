import type { GradeOptions, RampOptions } from "genshin-engine";

import walkway from "#src/data/login/walkway.json";
import { LOGIN_DOOR_POSITION } from "#src/services/login/door/constants";

// The flight down the walkway toward the door, read off the walkway in the captures by perspective alone
// (Login/Scene/Index.reference.ts's findings): its crossbars' and the door's widths give each frame's focal length and
// Distance, and the rows they stand at the eye's height. The eye holds 3.96 metres over the walkway's top, straight down
// Its middle toward the door along +z (a heading of half a turn), flying from 72.1 metres short of the door at the
// Dawn, dusk and night frames to 45.3 at the recording's last pose, pitching up from 5.6 to 6.9 degrees as its vertical
// Field of view widens from 44.6 to 51.2
const EYE_HEIGHT = 3.96;
export const LOGIN_CAMERA_HEIGHT = walkway.top + EYE_HEIGHT;
export const LOGIN_CAMERA_START_Z = LOGIN_DOOR_POSITION[2] - 72.1;
export const LOGIN_CAMERA_END_Z = LOGIN_DOOR_POSITION[2] - 45.3;
export const LOGIN_CAMERA_YAW = Math.PI;
export const LOGIN_CAMERA_START_PITCH = (5.6 * Math.PI) / 180;
export const LOGIN_CAMERA_END_PITCH = (6.9 * Math.PI) / 180;
export const LOGIN_CAMERA_START_FOV = 44.6;
export const LOGIN_CAMERA_END_FOV = 51.2;
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
