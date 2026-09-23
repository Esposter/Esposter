import type { Vector3Tuple } from "three";

import { Vector3 } from "three";
// The room, in voxels: a floor, a wall behind and a wall to the left, open to the camera on the other two sides
export const ROOM_WIDTH = 16;
export const ROOM_HEIGHT = 7;
export const ROOM_DEPTH = 12;
// Where the main agent stands while it is not using a tool
export const HOME_POSITION: Vector3Tuple = [8, 1, 6.5];
// How far apart two figures stand at one station
export const FIGURE_SPACING = 1.25;
// Voxels a second a figure walks
export const FIGURE_SPEED = 6;
// A standing figure rises and settles by a sliver of a voxel, a breath every couple of seconds
export const FIGURE_BREATH_HEIGHT = 0.05;
export const FIGURE_BREATH_SPEED = 3;
// A narrow field of view from far off, so the room reads nearly as an isometric diorama
export const CAMERA_FIELD_OF_VIEW = 30;
// The camera starts over the room's open corner, at its farthest, and turns around the player above the floor and
// Below the vertical, no farther out than it starts and no nearer than a few figures' height
export const CAMERA_START_AZIMUTH = Math.PI / 4;
export const CAMERA_START_POLAR = Math.PI / 4;
export const CAMERA_MIN_POLAR = Math.PI / 8;
export const CAMERA_MAX_POLAR = (3 * Math.PI) / 8;
export const CAMERA_MIN_DISTANCE = 8;
export const CAMERA_MAX_DISTANCE = 40;
// How fast the camera closes on where it should be, as a rate a second, which reads as a little weight
export const CAMERA_FOLLOW_SHARPNESS = 8;
// Radians the camera turns for each pixel a pointer drags, and each second a stick is held over
export const CAMERA_DRAG_SPEED = 0.005;
export const CAMERA_STICK_SPEED = 2.5;
// How much one unit of wheel movement scales the camera's distance, as an exponent
export const CAMERA_ZOOM_SPEED = 0.001;
// How far in front of a wall that would hide the player the camera is pulled in to
export const CAMERA_WALL_MARGIN = 0.25;
// The player: a box narrower than a voxel and as tall as a figure, walking a little over four voxels a second
export const PLAYER_HALF_WIDTH = 0.3;
export const PLAYER_HEIGHT = 2;
// Where the camera looks and its spring arm starts: the middle of the player's head
export const PLAYER_EYE_HEIGHT = 1.75;
export const PLAYER_SPEED = 4.3;
// The player's six boxes in sixteenths of a voxel, in the proportions a voxel person is expected to have: a head eight
// On a side, a body eight by twelve by four, and each limb four by twelve by four, two voxels tall in all
const PLAYER_PIXEL = 1 / 16;
export const PLAYER_HEAD_SCALE = new Vector3(8, 8, 8).multiplyScalar(PLAYER_PIXEL);
export const PLAYER_BODY_SCALE = new Vector3(8, 12, 4).multiplyScalar(PLAYER_PIXEL);
export const PLAYER_LIMB_SCALE = new Vector3(4, 12, 4).multiplyScalar(PLAYER_PIXEL);
// Where each box stands from its base or hangs from its top: the head on the body, the body on the hips, each arm from
// Its shoulder and each leg from its hip, so a limb swings about the joint it hangs from
export const PLAYER_HEAD_POSITION = new Vector3(0, 24, 0).multiplyScalar(PLAYER_PIXEL);
export const PLAYER_BODY_POSITION = new Vector3(0, 12, 0).multiplyScalar(PLAYER_PIXEL);
export const PLAYER_LEFT_ARM_POSITION = new Vector3(6, 24, 0).multiplyScalar(PLAYER_PIXEL);
export const PLAYER_RIGHT_ARM_POSITION = new Vector3(-6, 24, 0).multiplyScalar(PLAYER_PIXEL);
export const PLAYER_LEFT_LEG_POSITION = new Vector3(2, 12, 0).multiplyScalar(PLAYER_PIXEL);
export const PLAYER_RIGHT_LEG_POSITION = new Vector3(-2, 12, 0).multiplyScalar(PLAYER_PIXEL);
// The limbs swing through a full stride over this many voxels walked, out to this angle each way, and settle at this
// Rate a second once the player stops
export const PLAYER_STRIDE_LENGTH = 1.6;
export const PLAYER_SWING_ANGLE = 0.6;
export const PLAYER_SWING_SETTLE_RATE = 12;
// Movement advances in fixed steps, spending the time a frame took in whole steps. A frame longer than the cap — a tab
// Coming back from the background — is spent as the cap, so the player never jumps across the room
export const SIMULATION_STEP_SECONDS = 1 / 60;
export const MAX_FRAME_SECONDS = 0.25;
// A stick's tilt below this reads as resting, since a gamepad's sticks never quite centre
export const GAMEPAD_DEAD_ZONE = 0.15;
// Where the gauges stand: the context vessel in the back corner, the coins on the desk, the pages on the workbench,
// And the lantern under the gate's lintel
export const VESSEL_POSITION = new Vector3(1, 1, 3);
export const COINS_POSITION = new Vector3(10, 2, 9);
export const PAGES_POSITION = new Vector3(12, 2, 3);
export const LANTERN_POSITION = new Vector3(5, 3, 11);
// How tall the context vessel stands when the context is full
export const VESSEL_HEIGHT = 5;
// A stack grows by this much a coin or a changed file, and stops at the most it can hold
export const STACK_STEP = 0.25;
export const MAX_STACK_COUNT = 16;
export const COST_PER_COIN_USD = 0.25;
// How often the development overlay counts the frames drawn since it last looked
export const STATISTICS_INTERVAL_MS = Temporal.Duration.from({ seconds: 1 }).total("milliseconds");
// How far short of a solid voxel's face a blocked box stops, so rounding never leaves it touching the face, where the
// Next step along the face would read as blocked too
export const COLLISION_GAP = 1e-6;
