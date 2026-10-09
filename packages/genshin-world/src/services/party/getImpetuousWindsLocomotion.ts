import type { Locomotion } from "genshin-engine";

import { IMPETUOUS_WINDS_MOVEMENT_SPEED_MULTIPLIER } from "#src/services/party/constants";

// The locomotion a character under Impetuous Winds moves by: its walking, running, sprinting and dashing speeds raised
// By its Movement SPD, the movements the Movement Speed page of the Genshin Impact Wiki says it alters. A jump's air
// Speed carries the ground speed it left, so a jump is raised too
export const getImpetuousWindsLocomotion = (locomotion: Locomotion): Locomotion => ({
  ...locomotion,
  dashSpeed: locomotion.dashSpeed * IMPETUOUS_WINDS_MOVEMENT_SPEED_MULTIPLIER,
  runSpeed: locomotion.runSpeed * IMPETUOUS_WINDS_MOVEMENT_SPEED_MULTIPLIER,
  sprintSpeed: locomotion.sprintSpeed * IMPETUOUS_WINDS_MOVEMENT_SPEED_MULTIPLIER,
  walkSpeed: locomotion.walkSpeed * IMPETUOUS_WINDS_MOVEMENT_SPEED_MULTIPLIER,
});
