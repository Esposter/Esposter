import type { GradeOptions, RampOptions } from "genshin-engine";

// The camera, matched to the four time-of-day references, which share one pose: the walkway's edges meet 0.503 across
// And 0.571 down the frame, so it looks straight down the walkway pitched 3.37 degrees down, and the walkway's 5.4
// Metres fill 0.42 of the frame's foot from 4.1 metres over its surface. The game's vertical field of view is 45 degrees
export const LOGIN_CAMERA_FOV = 45;
export const LOGIN_CAMERA_HEIGHT = 4.1;
export const LOGIN_CAMERA_PITCH = (-3.37 * Math.PI) / 180;
// The camera's flight from the title's pose down the walkway to the door's, straight along -z
export const LOGIN_FLIGHT_DISTANCE = 130;
// Where every tower's and arcade's foot is, out of sight under the cloud sea
export const LOGIN_TOWER_FLOOR = -40;
// The cloud sea's top, far under the walkway: its billows meet the far towers 0.65 down the frame 150 metres out, and
// How far it reaches. The white under the walkway nearer in is the height fog it gives off
export const LOGIN_CLOUD_SEA_HEIGHT = -22;
export const LOGIN_CLOUD_SEA_SIZE = 3000;
export const LOGIN_STONE_COLOR = 0xf3e9e0;
export const LOGIN_RIM_STRENGTH = 0.4;
export const LOGIN_RAMP_OPTIONS: RampOptions = { resolution: 64, softness: 0.1, terminator: 0.5 };
export const LOGIN_GRADE_OPTIONS: GradeOptions = {
  contrast: 1,
  highlightTint: [0, 0, 0],
  saturation: 1.05,
  shadowTint: [0, 0, 0.02],
  size: 32,
};
// The haze the cloud sea gives off, thickest at its top and thinning up past the walkway, so what stands in it pales
// Downward and the far towers pale into the horizon's colour
// It is dense enough five metres under the walkway that a tower 17 metres out is white below the walkway's level, and
// Thins a third of itself a metre up, so the eye's height sees the far towers at 150 metres half hazed
export const LOGIN_FOG_BASE_HEIGHT = -5;
export const LOGIN_FOG_DENSITY = 0.08;
export const LOGIN_FOG_HEIGHT_FALLOFF = 0.33;
export const LOGIN_FOG_START_DISTANCE = 10;
export const LOGIN_LIGHT_DISTANCE = 120;
// The light's shadow map: its size, the half width of the square it covers about the camera's view, and its biases
export const LOGIN_SHADOW_MAP_SIZE = 2048;
export const LOGIN_SHADOW_EXTENT = 50;
export const LOGIN_SHADOW_BIAS = -0.0005;
export const LOGIN_SHADOW_NORMAL_BIAS = 0.03;
export const LOGIN_CLOUD_COVERAGE = 0.4;
