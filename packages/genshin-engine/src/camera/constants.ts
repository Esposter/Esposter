import type { FollowCameraSettings } from "#src/models/camera/FollowCameraSettings";

import { MathUtils } from "three";

// The speed a free camera flies at on the ground, in metres a second, and how much faster each metre above the ground
// Makes it, so a crossing takes seconds while a slow pass over grass stays slow
export const FREE_CAMERA_BASE_SPEED = 8;
export const FREE_CAMERA_SPEED_PER_HEIGHT = 0.5;
// The least height the camera holds above the ground, in metres
export const FREE_CAMERA_CLEARANCE = 1.5;
// The steepest a look can tilt, just short of straight up or down so the view never flips over the pole
export const FREE_CAMERA_MAX_PITCH: number = Math.PI / 2 - 0.01;
// The settings the follow camera starts at, and the sensitivity its look turns at as it always has, the middle of the
// Game's 1 to 5 range
// Provisional: the game's defaults, read off the Settings screen's Controls tab in the interface export
export const FOLLOW_CAMERA_DEFAULT_SETTINGS: FollowCameraSettings = {
  defaultDistance: 5,
  horizontalSensitivity: 3,
  verticalSensitivity: 3,
};
export const FOLLOW_CAMERA_NEUTRAL_SENSITIVITY = 3;
// The follow camera's pivot, at this share of the body's height above its feet, as recordings of the game frame its
// Characters. Its vertical field of view in degrees, the one the game sets its world camera to. The steepest it looks
// Down and up, and the nearest and furthest the wheel takes it to in metres, as the game's camera profile holds them
// (`genshin:assets camera`): its global config's elevation limits, its nearest zoom radius and its furthest on foot
export const FOLLOW_CAMERA_PIVOT_SHARE = 0.7;
export const FOLLOW_CAMERA_FOV = 45;
export const FOLLOW_CAMERA_MIN_PITCH: number = MathUtils.degToRad(-89);
export const FOLLOW_CAMERA_MAX_PITCH: number = MathUtils.degToRad(89);
export const FOLLOW_CAMERA_MIN_DISTANCE = 1;
export const FOLLOW_CAMERA_MAX_DISTANCE = 6;
// Provisional, each read off a recording of the camera in play: how far a notch moves it, and how fast it eases back
// Out once what pulled it in has cleared, in metres a second
export const FOLLOW_CAMERA_DISTANCE_PER_ZOOM_STEP = 0.5;
export const FOLLOW_CAMERA_EASE_OUT_SPEED = 4;
// The room the eye keeps from the ground, the water's surface and the landmarks, the radius of the sphere its arm casts,
// And how far apart the arm is stepped through the terrain's height function, in metres
export const FOLLOW_CAMERA_CLEARANCE = 0.2;
export const FOLLOW_CAMERA_ARM_STEP = 0.25;
