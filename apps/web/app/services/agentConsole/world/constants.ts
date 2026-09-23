import type { VoxelBox } from "@/models/agentConsole/world/VoxelBox";
import type { Vector3Tuple } from "three";

import { PaletteColor } from "@/models/agentConsole/PaletteColor";
import { Vector3 } from "three";
// The room, in voxels: a floor walled on all four sides
export const ROOM_WIDTH = 16;
export const ROOM_HEIGHT = 7;
export const ROOM_DEPTH = 13;
// The door's opening in the left wall, two voxels wide and four tall, and where the player and the main agent walk in,
// Just inside it
export const DOOR_MIN_Z = 8;
export const DOOR_MAX_Z = 9;
export const DOOR_HEIGHT = 4;
export const DOOR_POSITION: Vector3Tuple = [1.5, 1, 9];
// The door fills its opening while it is closed, and swung open outward on a hinge at the opening's far edge, it stands
// Straight out from the wall, as wide as the opening. It is used from the middle of the opening, so from either side
export const DOOR_CLOSED_BOX: VoxelBox = {
  color: PaletteColor.Wood,
  max: [0, DOOR_HEIGHT, DOOR_MAX_Z],
  min: [0, 1, DOOR_MIN_Z],
};
export const DOOR_OPEN_BOX: VoxelBox = {
  color: PaletteColor.Wood,
  max: [-1, DOOR_HEIGHT, DOOR_MAX_Z + 1],
  min: [DOOR_MIN_Z - DOOR_MAX_Z - 1, 1, DOOR_MAX_Z + 1],
};
export const DOOR_STAND_POSITION: Vector3Tuple = [0.5, 1, (DOOR_MIN_Z + DOOR_MAX_Z + 1) / 2];
// Where the main agent stands while it is not using a tool
export const HOME_POSITION: Vector3Tuple = [8, 1, 6.5];
// The world around the room: columns of Minecraft's sixteen by sixteen voxels, this tall
export const CHUNK_SIZE = 16;
export const WORLD_HEIGHT = 32;
// How far past the player the world can be seen: the fog thickens from halfway there to there, counted from wherever
// The camera's arm has it, and the camera sees no further, so a chunk is generated only where some of the camera's
// View reaches, and dropped a chunk further out, so a player pacing a border never regenerates one
export const VIEW_DISTANCE = 48;
export const FOG_NEAR_DISTANCE = VIEW_DISTANCE / 2;
// How many chunks the worker is handed at once: one to work on and one waiting, so it never waits on a round trip and
// Never works through a backlog the player has walked away from
export const MAX_REQUESTED_CHUNK_COUNT = 2;
// A chunk's grid also holds a border this wide of its neighbours' voxels, so its edge faces are culled and shaded
// Against what is really beside them, and its padded side is this long
export const CHUNK_BORDER = 1;
export const CHUNK_GRID_SIZE = CHUNK_SIZE + 2 * CHUNK_BORDER;
// The seed is the whole save: the same seed is the same world on every load
export const WORLD_SEED = 20_260_924;
// The ground's height is octaves of noise summed, each twice the detail and half the height of the last, the first
// Spanning this many voxels, around a base height and reaching this far above or below it
export const TERRAIN_OCTAVE_COUNT = 4;
export const TERRAIN_SCALE = 64;
export const TERRAIN_BASE_HEIGHT = 6;
export const TERRAIN_AMPLITUDE = 14;
// Around the room the ground is flattened to its floor for this many voxels, then rises to the noise over this many
export const ROOM_FLAT_MARGIN = 4;
export const ROOM_BLEND_DISTANCE = 16;
// Under the grass, this many voxels of dirt before the stone
export const DIRT_DEPTH = 3;
// An agent's figure is a voxel wide and two thirds of one deep
export const FIGURE_HALF_WIDTH = 0.5;
export const FIGURE_HALF_DEPTH = 1 / 3;
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
// How much wider the camera sees while the player sprints, as Minecraft's view widens with speed
export const CAMERA_SPRINT_FIELD_OF_VIEW_RATIO = 1.15;
// A field of view this close to where it is easing is put there, so the easing ends
export const CAMERA_FIELD_OF_VIEW_SNAP = 0.01;
// How fast the camera closes on where it should be, as a rate a second, which reads as a little weight
export const CAMERA_FOLLOW_SHARPNESS = 8;
// Radians the camera turns for each pixel a pointer drags, and each second a stick is held over
export const CAMERA_DRAG_SPEED = 0.005;
export const CAMERA_STICK_SPEED = 2.5;
// How much one unit of wheel movement scales the camera's distance, as an exponent
export const CAMERA_ZOOM_SPEED = 0.001;
// How far in front of a wall that would hide the player the camera is pulled in to
export const CAMERA_WALL_MARGIN = 0.25;
// The player: a box narrower than a voxel and as tall as a figure, a quarter shorter while sneaking
export const PLAYER_HALF_WIDTH = 0.3;
export const PLAYER_HEIGHT = 2;
export const PLAYER_SNEAKING_HEIGHT = 1.5;
// Where the camera looks and its spring arm starts: the middle of the player's head, which sneaking lowers
export const PLAYER_EYE_HEIGHT = 1.75;
export const PLAYER_SNEAK_DROP = PLAYER_HEIGHT - PLAYER_SNEAKING_HEIGHT;
// Minecraft's own movement, in its units of blocks and ticks of a twentieth of a second. On the ground a tick adds the
// Walk's acceleration and then keeps the velocity's share the block's slipperiness and the air's drag leave, so a walk
// Settles a little over four blocks a second; in the air the drag alone slows it and the acceleration is a fifth. A
// Sprint is three tenths faster and a sneak three tenths of a walk
export const TICK_SECONDS = 1 / 20;
export const GROUND_FRICTION = 0.6 * 0.91;
export const AIR_FRICTION = 0.91;
export const GROUND_ACCELERATION = 0.1;
export const AIR_ACCELERATION = 0.02;
export const SPRINT_MULTIPLIER = 1.3;
export const SNEAK_MULTIPLIER = 0.3;
// A jump starts at this upward speed a tick, and gravity takes this much off it each tick before the air's drag, so
// It clears a block with a little to spare. A jump from a sprint also pushes the player this far on the way it faces
export const JUMP_VELOCITY = 0.42;
export const GRAVITY = 0.08;
export const VERTICAL_DRAG = 0.98;
export const SPRINT_JUMP_BOOST = 0.2;
// Forward pressed twice within this long starts a sprint, as Minecraft's double tap does
export const SPRINT_DOUBLE_TAP_MS = Temporal.Duration.from({ milliseconds: 350 }).total("milliseconds");
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
// Movement advances in fixed steps, this many to one of Minecraft's ticks, spending the time a frame took in whole
// Steps. A frame longer than the cap — a tab coming back from the background — is spent as the cap, so the player
// Never jumps across the room
export const STEPS_PER_TICK = 3;
export const SIMULATION_STEP_SECONDS = TICK_SECONDS / STEPS_PER_TICK;
export const MAX_FRAME_SECONDS = 0.25;
// A stick's tilt below this reads as resting, since a gamepad's sticks never quite centre
export const GAMEPAD_DEAD_ZONE = 0.15;
// Where the gauges stand: the context vessel in the back corner, the coins on the desk, the pages on the workbench,
// And the lantern under the gate's lintel
export const VESSEL_POSITION = new Vector3(1, 1, 3);
export const COINS_POSITION = new Vector3(10, 2, 9);
export const PAGES_POSITION = new Vector3(12, 2, 3);
export const LANTERN_POSITION = new Vector3(5, 3, 11);
// Where a player stands to read each gauge: beside the vessel, at the desk's front for the coins, and at the
// Workbench's end for the pages, clear of the stations' own spots
export const VESSEL_STAND_POSITION: Vector3Tuple = [2.5, 1, 3.5];
export const COINS_STAND_POSITION: Vector3Tuple = [10.5, 1, 11.3];
export const PAGES_STAND_POSITION: Vector3Tuple = [10.3, 1, 3.5];
// How near a thing's spot a player stands for it to prompt, how much wider than the thing its outline is drawn, and
// How far above the outline its label floats
export const REACH_DISTANCE = 1.5;
export const PROMPT_OUTLINE_MARGIN = 0.05;
export const PROMPT_LABEL_HEIGHT = 0.5;
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
