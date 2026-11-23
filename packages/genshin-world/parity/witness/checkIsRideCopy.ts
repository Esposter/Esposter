import type { Object3D } from "three";

import { IN_FAMILY_KEY } from "#src/services/scene/constants";
import { Matrix4 } from "three";

// Whether a mesh sits beneath a copy the scene makes of an export (`rideLoginWitnessDoor`), whose root holds the copy's
// Placement within its family. Every such mesh is the export's geometry drawn a second time
export const checkIsRideCopy = (object: Object3D): boolean => {
  for (let node: null | Object3D = object; node; node = node.parent)
    if (node.userData[IN_FAMILY_KEY] instanceof Matrix4) return true;
  return false;
};
