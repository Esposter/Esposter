import type { Locomotion } from "genshin-engine";

// The locomotion a character moves by at its Movement SPD: its walking, running, sprinting and dashing speeds raised by
// It, and a jump raised too, as its air speed carries the ground speed it left
export const getMovementSpeedLocomotion = (locomotion: Locomotion, movementSpeed: number): Locomotion => {
  const multiplier = 1 + movementSpeed;
  return {
    ...locomotion,
    dashSpeed: locomotion.dashSpeed * multiplier,
    runSpeed: locomotion.runSpeed * multiplier,
    sprintSpeed: locomotion.sprintSpeed * multiplier,
    walkSpeed: locomotion.walkSpeed * multiplier,
  };
};
