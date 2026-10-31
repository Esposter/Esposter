import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/shared/ParityPassMeasure";

import { getCurrentBuildReferenceIds } from "#src/services/genshinParity/passes/getCurrentBuildReferenceIds";
import { measureEachReference } from "#src/services/genshinParity/passes/measureEachReference";
import { solveReferenceCamera } from "#src/services/genshinParity/passes/solveReferenceCamera";
import { CAMERA_POSE_AXES } from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { getPoseBar } from "#src/services/genshinParity/witness/getPoseBar";

// The camera pass: each current build's reference's landmarks against where the scene's own camera, in the reference's
// State and moved along the glide alone (`solveReferenceCamera`), projects them, their root mean square in the
// Reference's pixels and each landmark's distance, held to the reference's pose bar (`getPoseBar`), the bar `pose --write`
// Holds a solved camera to
export const measureCamera = async (component: DerivedAssetComponent): Promise<ParityPassMeasure> => {
  const referenceIds = getCurrentBuildReferenceIds(component);
  if (referenceIds.length === 0) return { notes: ["no current build's reference with landmarks"], readings: [] };
  await fetchReferences();
  return measureEachReference(component, referenceIds, async (referenceId, { page }) => {
    const { errors, names, pose, rms } = await solveReferenceCamera(page, referenceId, component);
    return {
      notes: [
        `${referenceId} from ${CAMERA_POSE_AXES.map((axis, index) => `${axis} ${(pose[index] ?? 0).toFixed(3)}`).join(", ")}`,
        ...names.map((name, index) => `${referenceId} ${name}: ${(errors[index] ?? 0).toFixed(2)} px`),
      ],
      readings: [{ gate: getPoseBar(referenceId), name: referenceId, unit: "px", value: rms }],
    };
  });
};
