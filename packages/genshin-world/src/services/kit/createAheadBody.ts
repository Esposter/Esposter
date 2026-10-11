import type { KitBody } from "#src/models/kit/KitBody";

// A body the given metres ahead of another at its facing: ahead lies at the bearing -sin and -cos of the facing, as the
// Facing angle of the kit's targeting reads it
export const createAheadBody = ({ facing, height, position }: KitBody, metres: number): KitBody => ({
  facing,
  height,
  position: { x: position.x - Math.sin(facing) * metres, z: position.z - Math.cos(facing) * metres },
});
