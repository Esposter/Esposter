// The speed a free camera flies at on the ground, in metres a second, and how much faster each metre above the ground
// Makes it, so a crossing takes seconds while a slow pass over grass stays slow
export const FREE_CAMERA_BASE_SPEED = 8;
export const FREE_CAMERA_SPEED_PER_HEIGHT = 0.5;
// The least height the camera holds above the ground, in metres
export const FREE_CAMERA_CLEARANCE = 1.5;
// The steepest a look can tilt, just short of straight up or down so the view never flips over the pole
export const FREE_CAMERA_MAX_PITCH: number = Math.PI / 2 - 0.01;
