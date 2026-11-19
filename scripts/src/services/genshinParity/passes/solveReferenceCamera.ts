import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { Page } from "playwright";

import { getReferenceCameraPose } from "#src/services/genshinParity/passes/getReferenceCameraPose";
import { CAMERA_POSE_AXES } from "#src/services/genshinParity/shared/constants";
import { readReferenceLandmarks } from "#src/services/genshinParity/witness/readReferenceLandmarks";
import { solveCameraPose } from "#src/services/genshinParity/witness/solveCameraPose";
import { InvalidOperationError, Operation } from "@esposter/shared";

const GLIDE_AXIS = CAMERA_POSE_AXES.indexOf("z");
const HELD_AXES = CAMERA_POSE_AXES.map((_axis, index) => index).filter((index) => index !== GLIDE_AXIS);
// The camera a reference's exports are drawn from, solved from the reference alone and never from the scene's camera, so
// A change to our camera cannot move the exports' frame or any gate read off it. A reference that records its camera
// (`getReferenceCameraPose`) starts from it, its eye moved along the glide alone to where its landmarks stand it, since
// How far the glide has come is the Motion pass's. One that records none is solved on all six axes from its landmarks,
// Which needs six of them or it throws. Its pose, each landmark's distance and their root mean square in the reference's
// Pixels, with the landmarks the witness holds only; `waiting` names the rest. With none held a recorded camera is the
// Pose, and a reference with neither a recorded camera nor a landmark held to solve from throws
export const solveReferenceCamera = async (
  page: Page,
  referenceId: string,
  component: DerivedAssetComponent,
): Promise<{ errors: number[]; names: string[]; pose: number[]; rms?: number | undefined; waiting: string[] }> => {
  const recorded = getReferenceCameraPose(referenceId);
  const { correspondences, height, names, waiting, width } = await readReferenceLandmarks(page, referenceId, component);
  if (correspondences.length === 0) {
    if (!recorded)
      throw new InvalidOperationError(
        Operation.Read,
        referenceId,
        "records no camera and holds no landmark to solve one from: pose --write it",
      );
    return { errors: [], names, pose: recorded, rms: undefined, waiting };
  }
  return { names, waiting, ...solveCameraPose(correspondences, width, height, recorded, recorded ? HELD_AXES : []) };
};
