import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";
import type { WitnessView } from "genshin-world/parity/models/witness/WitnessView";

import { CAMERA_GATE_PIXELS } from "#src/services/genshinParity/passes/constants";
import { getComponentReferenceIds } from "#src/services/genshinParity/passes/getComponentReferenceIds";
import { CAMERA_POSE_AXES } from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { fromPageCamera } from "#src/services/genshinParity/shared/fromPageCamera";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { readReferenceLandmarks } from "#src/services/genshinParity/witness/readReferenceLandmarks";
import { solveCameraPose } from "#src/services/genshinParity/witness/solveCameraPose";
import { withFinalizerAsync } from "@esposter/shared";

// The camera pass: each current build's reference's landmarks against where the scene's own camera, in the reference's state, projects
// Them, their root mean square in the reference's pixels and each landmark's distance, with the eye moved along the
// Glide alone to where the reference stands it, since how far the glide has come is the motion pass's
const GLIDE_AXIS = CAMERA_POSE_AXES.indexOf("z");
const HELD_AXES = CAMERA_POSE_AXES.map((_axis, index) => index).filter((index) => index !== GLIDE_AXIS);
export const measureCamera = async (component: DerivedAssetComponent): Promise<ParityPassMeasure> => {
  const referenceIds = getComponentReferenceIds(component).filter(
    (referenceId) => ParityReferenceMap[referenceId]?.landmarks && !ParityReferenceMap[referenceId].isOtherBuild,
  );
  await fetchReferences();
  const measures: ParityPassMeasure[] = [];
  for (const referenceId of referenceIds) {
    // oxlint-disable-next-line no-await-in-loop -- one browser is open at a time
    const { browser, page } = await openWitnessPage(referenceId, component);
    // oxlint-disable-next-line no-await-in-loop -- one browser is open at a time
    const measure = await withFinalizerAsync(
      async () => {
        const camera = await page.evaluate(() =>
          (Reflect.get(window, "getSceneCamera") as () => NonNullable<WitnessView["camera"]>)(),
        );
        const { correspondences, height, names, width } = await readReferenceLandmarks(page, referenceId, component);
        const { errors, pose, rms } = solveCameraPose(
          correspondences,
          width,
          height,
          fromPageCamera(camera),
          HELD_AXES,
        );
        return {
          notes: [
            `${referenceId} from ${CAMERA_POSE_AXES.map((axis, index) => `${axis} ${(pose[index] ?? 0).toFixed(3)}`).join(", ")}`,
            ...names.map((name, index) => `${referenceId} ${name}: ${(errors[index] ?? 0).toFixed(2)} px`),
          ],
          readings: [{ gate: CAMERA_GATE_PIXELS, name: referenceId, unit: "px", value: rms }],
        };
      },
      () => browser.close(),
    );
    measures.push(measure);
  }
  return { notes: measures.flatMap(({ notes }) => notes), readings: measures.flatMap(({ readings }) => readings) };
};
