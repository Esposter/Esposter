import type { WindrisePlant } from "#src/models/windrise/WindrisePlant";
import type { Matrix4 } from "three";

import { composeHeadingMatrix } from "#src/services/world/composeHeadingMatrix";
import { Vector3 } from "three";

type WindrisePlace = WindrisePlant["places"][number];

const point = new Vector3();
const scale = new Vector3();

// A matrix written in place for one place a plant stands at: on the ground under it, turned about the vertical by its
// turn, and scaled by its own scale times the factor its stand-in's geometry is drawn at
export const composePlantPlaceMatrix = (
  matrix: Matrix4,
  { position: { x, z }, rotation, scale: [scaleX = 1, scaleY = 1, scaleZ = 1] }: WindrisePlace,
  getGroundHeight: (x: number, z: number) => number,
  factor: Vector3,
): Matrix4 =>
  composeHeadingMatrix(
    matrix,
    point.set(x, getGroundHeight(x, z), z),
    rotation,
    scale.set(scaleX * factor.x, scaleY * factor.y, scaleZ * factor.z),
  );
