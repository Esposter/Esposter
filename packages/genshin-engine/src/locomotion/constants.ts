import { LocomotionState } from "#src/models/locomotion/LocomotionState";

// The stamina pool as the game gives it: 100 to start, shared by the party, refilled at 25 a second once a second and a
// Half passes with no action that costs it
export const STAMINA_MAX = 100;
export const STAMINA_REFILL_PER_SECOND = 25;
export const STAMINA_REFILL_DELAY_SECONDS = 1.5;
// What each action costs: a dash, a second of sprint, a climb's jump, a stroke in water, a swim's dash to start and a
// Second of it, and what a climb needs to start
export const DASH_STAMINA_COST = 18;
export const SPRINT_STAMINA_PER_SECOND = 18;
export const CLIMB_JUMP_STAMINA_COST = 25;
export const SWIM_STROKE_STAMINA_COST = 4;
export const SWIM_DASH_STAMINA_COST = 2;
export const SWIM_DASH_STAMINA_PER_SECOND = 10.2;
export const CLIMB_START_STAMINA = 5;
// Provisional: the wiki's approximation from player testing, measured off a recording of the meter draining in a glide
export const GLIDE_STAMINA_PER_SECOND = 3;
// Provisional: unknown on the wiki, measured off a recording of the meter draining on a wall
export const CLIMB_STAMINA_PER_SECOND = 4;
// Provisional: the seconds between swimming strokes, read off the swim clip's length by `genshin:assets locomotion`
export const SWIM_STROKE_SECONDS = 1;
// The states stamina refills in, on the ground and in the air outside the glider; a wall, water and the glider hold it
export const STAMINA_REFILL_STATES: readonly LocomotionState[] = [
  LocomotionState.Fall,
  LocomotionState.Idle,
  LocomotionState.Jump,
  LocomotionState.Plunge,
  LocomotionState.Run,
  LocomotionState.Walk,
];
// The states the body stands on the ground in, is in the air in, holds a wall in and is in water in
export const AIR_LOCOMOTION_STATES: readonly LocomotionState[] = [LocomotionState.Fall, LocomotionState.Jump];
export const CLIMB_LOCOMOTION_STATES: readonly LocomotionState[] = [LocomotionState.Climb, LocomotionState.ClimbJump];
export const WATER_LOCOMOTION_STATES: readonly LocomotionState[] = [
  LocomotionState.Drown,
  LocomotionState.Swim,
  LocomotionState.SwimDash,
];
export const GROUND_LOCOMOTION_STATES: readonly LocomotionState[] = [
  LocomotionState.Dash,
  LocomotionState.Idle,
  LocomotionState.Run,
  LocomotionState.Sprint,
  LocomotionState.Walk,
];
// The share of a move's full tilt under which a stick's push walks rather than runs, as a light push walks in the game
// Provisional: read off a recording of a pad's stick pushed through its travel
export const WALK_MOVE_MAGNITUDE = 0.5;
// How near its feet a walkable surface must be for the body to stand on it, in metres
export const GROUND_CONTACT_DISTANCE = 0.05;
// How fast a standing body is pressed into what it stands on and a climbing one into its wall, in metres a second, so
// The push back out of a landmark reports its floor or its wall at every step
export const GROUND_PRESS_SPEED = 1;
export const WALL_PRESS_SPEED = 1;
// How far past its capsule the body looks ahead for a wall, in metres
export const WALL_PROBE_DISTANCE = 0.1;
// Provisional: how fast a body on ground too steep to stand on slides down it, read off a recording of a fall onto a
// Cliff with no stamina left
export const STEEP_SLIDE_SPEED = 4;
// Provisional: the seconds a fall must last before a wall is caught again, so a drop is not caught at once by the move
// Still pushing into the wall, read off a recording of a drop
export const CLIMB_REGRAB_SECONDS = 0.5;
