import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { Page } from "playwright";

import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { toPageCamera } from "#src/services/genshinParity/shared/toPageCamera";
import { readReferenceLandmarks } from "#src/services/genshinParity/witness/readReferenceLandmarks";
import { solveCameraPose } from "#src/services/genshinParity/witness/solveCameraPose";

// A current build's reference is seen from the scene's own camera, which the camera pass holds; an older build's from
// Its own, solved on its landmarks
export const setReferenceView = async (
  page: Page,
  referenceId: string,
  witness: DerivedAssetComponent,
): Promise<void> => {
  if (!ParityReferenceMap[referenceId]?.isOtherBuild) return setPageWitnessView(page, {});

  const { correspondences, height, width } = await readReferenceLandmarks(page, referenceId, witness);
  const { pose } = solveCameraPose(correspondences, width, height);
  await setPageWitnessView(page, { camera: toPageCamera(pose) });
};
