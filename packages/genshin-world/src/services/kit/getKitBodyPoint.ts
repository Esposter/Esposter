import type { KitBody } from "#src/models/kit/KitBody";
import type { GroundPoint } from "genshin-engine";

// A point the given metres ahead of a body and the given metres to its right, on the ground at its facing: ahead lies at
// the bearing -sin and -cos of the facing, as createAheadBody reads it, and right a quarter turn clockwise from it
export const getKitBodyPoint = ({ facing, position }: KitBody, forward: number, right: number): GroundPoint => ({
  x: position.x - Math.sin(facing) * forward + Math.cos(facing) * right,
  z: position.z - Math.cos(facing) * forward - Math.sin(facing) * right,
});
