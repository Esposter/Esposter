import type { GradeOptions, RampOptions } from "genshin-engine";

import walkway from "#src/data/login/walkway.json";
import { LOGIN_DOOR_POSITION } from "#src/services/login/door/constants";

// The camera, matched to the four time-of-day references, which share one pose: the walkway's edges meet 0.503 across
// And 0.571 down the frame, so it looks straight down the walkway pitched 3.37 degrees down, and the walkway's fitted
// Width fills 0.42 of the frame's foot, which puts the eye 0.76 of that width over its surface, at the game's 45 degree
// Vertical field of view. The first wings' near edge meets the frame 0.807 down, 3.15 of that height ahead, so the
// Camera starts beyond the walkway's far end, past the wings with the greatest z, and looks along -z toward the door:
// From that end the character select's towers stand where the captures show them, beside the walkway
// The walkway's own width, apart from its wings: the half width most of its outline's corners share
const halfWidthCounts = Map.groupBy(walkway.outline, ([x = 0]) => Math.round(Math.abs(x) * 10) / 10);
const [[walkwayHalfWidth] = [0]] = [...halfWidthCounts.entries()].toSorted(([, a], [, b]) => b.length - a.length);
const WALKWAY_WIDTH = walkwayHalfWidth * 2;
const EYE_SHARE = 0.76;
const FIRST_WING_DISTANCE_SHARE = 3.15;
const firstWingEdge = Math.max(...walkway.outline.filter(([x = 0]) => x > WALKWAY_WIDTH / 2 + 1).map(([, z = 0]) => z));
export const LOGIN_CAMERA_FOV = 45;
export const LOGIN_CAMERA_HEIGHT = walkway.top + WALKWAY_WIDTH * EYE_SHARE;
export const LOGIN_CAMERA_PITCH = (-3.37 * Math.PI) / 180;
export const LOGIN_CAMERA_START_Z = firstWingEdge + LOGIN_CAMERA_HEIGHT * FIRST_WING_DISTANCE_SHARE;
// The flight ends where the door's foot meets the frame 0.722 down, as the English recording's last pose shows it:
// 3.93 of the camera's height short of the door, flown along -z
const DOOR_DISTANCE_SHARE = 3.93;
export const LOGIN_FLIGHT_DISTANCE =
  LOGIN_CAMERA_START_Z - (LOGIN_DOOR_POSITION[2] + LOGIN_CAMERA_HEIGHT * DOOR_DISTANCE_SHARE);
export const LOGIN_CAMERA_FAR = 8000;
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
