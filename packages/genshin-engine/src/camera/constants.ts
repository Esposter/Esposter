// The speed a free camera flies at on the ground, in metres a second, and how much faster each metre above the ground
// Makes it, so a crossing takes seconds while a slow pass over grass stays slow
export const FREE_CAMERA_BASE_SPEED = 8;
export const FREE_CAMERA_SPEED_PER_HEIGHT = 0.5;
// The least height the camera holds above the ground, in metres
export const FREE_CAMERA_CLEARANCE = 1.5;
// The steepest a look can tilt, just short of straight up or down so the view never flips over the pole
export const FREE_CAMERA_MAX_PITCH: number = Math.PI / 2 - 0.01;
// Provisional, each solved off recordings of the game's camera in play by `genshin:parity pose`: the follow camera's
// Pivot above the feet, its field of view in degrees, the steepest it looks down and up in radians, the distance it
// Starts and resets at within the settings' 4.5 to 6.0, the nearest and furthest the wheel takes it to, how far a notch
// Moves it, and how fast it eases back out once what pulled it in has cleared, in metres a second
export const FOLLOW_CAMERA_PIVOT_HEIGHT = 1.5;
export const FOLLOW_CAMERA_FOV = 45;
export const FOLLOW_CAMERA_MIN_PITCH = -1.3;
export const FOLLOW_CAMERA_MAX_PITCH = 1.1;
export const FOLLOW_CAMERA_DEFAULT_DISTANCE = 5;
export const FOLLOW_CAMERA_MIN_DISTANCE = 1.5;
export const FOLLOW_CAMERA_MAX_DISTANCE = 8;
export const FOLLOW_CAMERA_DISTANCE_PER_ZOOM_STEP = 0.5;
export const FOLLOW_CAMERA_EASE_OUT_SPEED = 4;
// The room the eye keeps from the ground, the water's surface and the landmarks, the radius of the sphere its arm casts,
// And how far apart the arm is stepped through the terrain's height function, in metres
export const FOLLOW_CAMERA_CLEARANCE = 0.2;
export const FOLLOW_CAMERA_ARM_STEP = 0.25;
