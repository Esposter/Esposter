import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { WitnessTargetsRead } from "#src/models/genshinParity/passes/WitnessTargetsRead";
import type { ParityPassMeasure } from "#src/models/genshinParity/shared/ParityPassMeasure";
import type { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import type { WitnessView } from "genshin-world/parity/models/witness/WitnessView";
import type { Page } from "playwright";

import { SHAPE_WIDTH } from "#src/services/genshinParity/passes/constants";
import { getCurrentBuildReferenceIds } from "#src/services/genshinParity/passes/getCurrentBuildReferenceIds";
import { measureEachReference } from "#src/services/genshinParity/passes/measureEachReference";
import { solveReferenceCamera } from "#src/services/genshinParity/passes/solveReferenceCamera";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { readWitnessTargets } from "#src/services/genshinParity/shared/readWitnessTargets";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { toPageCamera } from "#src/services/genshinParity/shared/toPageCamera";

// A pass judged on the witness's targets: at each current build's reference's camera (`solveReferenceCamera`), the
// Exports' families and then our own drawn alone into the targets named, at the shape's width, and the two handed to
// The pass's own comparison, whose readings and notes are gathered over every reference
export const measureFamilyTargets = async (
  component: DerivedAssetComponent,
  targetNames: readonly WitnessTargetName[],
  compare: (
    referenceId: string,
    exportsRead: WitnessTargetsRead,
    oursRead: WitnessTargetsRead,
    page: Page,
    camera: NonNullable<WitnessView["camera"]>,
  ) => ParityPassMeasure | Promise<ParityPassMeasure>,
): Promise<ParityPassMeasure> => {
  await fetchReferences();
  return measureEachReference(
    component,
    getCurrentBuildReferenceIds(component),
    async (referenceId, { page }) => {
      const { pose } = await solveReferenceCamera(page, referenceId, component);
      const camera = toPageCamera(pose);
      await setPageWitnessView(page, { camera, isAlone: true });
      const exportsRead = await readWitnessTargets(page, targetNames);
      await setPageWitnessView(page, { camera, families: [], isAlone: true });
      const oursRead = await readWitnessTargets(page, targetNames, true);
      return compare(referenceId, exportsRead, oursRead, page, camera);
    },
    SHAPE_WIDTH,
  );
};
