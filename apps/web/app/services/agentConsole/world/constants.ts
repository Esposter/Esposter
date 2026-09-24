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
// A camera far off with a narrow field of view, so the room reads nearly as an isometric diorama
export const CAMERA_POSITION = new Vector3(30, 24, 30);
export const CAMERA_TARGET = new Vector3(7, 1, 5);
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
