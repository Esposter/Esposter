import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { WitnessView } from "genshin-world/parity/models/witness/WitnessView";
import type { Page } from "playwright";

import { CAMERA_POSE_AXES } from "#src/services/genshinParity/shared/constants";
import { fromPageCamera } from "#src/services/genshinParity/shared/fromPageCamera";
import { readReferenceLandmarks } from "#src/services/genshinParity/witness/readReferenceLandmarks";
import { solveCameraPose } from "#src/services/genshinParity/witness/solveCameraPose";

const GLIDE_AXIS = CAMERA_POSE_AXES.indexOf("z");
const HELD_AXES = CAMERA_POSE_AXES.map((_axis, index) => index).filter((index) => index !== GLIDE_AXIS);
// The camera a reference was drawn from, as the scene draws it on its open page in the reference's state, with the eye
// Moved along the glide alone to where the reference's landmarks stand it, since how far the glide has come is the
// Motion pass's: the pose, and each landmark's distance and their root mean square in the reference's pixels
export const solveReferenceCamera = async (
  page: Page,
  referenceId: string,
  component: DerivedAssetComponent,
): Promise<{ errors: number[]; names: string[]; pose: number[]; rms: number }> => {
  const camera = await page.evaluate(() =>
    (Reflect.get(window, "getSceneCamera") as () => NonNullable<WitnessView["camera"]>)(),
  );
  const { correspondences, height, names, width } = await readReferenceLandmarks(page, referenceId, component);
  return { names, ...solveCameraPose(correspondences, width, height, fromPageCamera(camera), HELD_AXES) };
};
