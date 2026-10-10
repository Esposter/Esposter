import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";
import type { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import type { WitnessView } from "genshin-world/parity/models/witness/WitnessView";
import type { Page } from "playwright";

import { SHAPE_WIDTH } from "#src/services/genshinParity/passes/constants";
import { getCurrentBuildReferenceIds } from "#src/services/genshinParity/passes/getCurrentBuildReferenceIds";
import { solveReferenceCamera } from "#src/services/genshinParity/passes/solveReferenceCamera";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { readWitnessTargets } from "#src/services/genshinParity/shared/readWitnessTargets";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { toPageCamera } from "#src/services/genshinParity/shared/toPageCamera";
import { withFinalizerAsync } from "@esposter/shared";

type WitnessTargetsRead = Awaited<ReturnType<typeof readWitnessTargets>>;
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
  const measures: ParityPassMeasure[] = [];
  for (const referenceId of getCurrentBuildReferenceIds(component)) {
    // oxlint-disable-next-line no-await-in-loop -- one browser is open at a time
    const { close, page } = await openWitnessPage(referenceId, component, SHAPE_WIDTH);
    // oxlint-disable-next-line no-await-in-loop -- one browser is open at a time
    const measure = await withFinalizerAsync(
      async () => {
        const { pose } = await solveReferenceCamera(page, referenceId, component);
        const camera = toPageCamera(pose);
        await setPageWitnessView(page, { camera, isAlone: true });
        const exportsRead = await readWitnessTargets(page, targetNames);
        await setPageWitnessView(page, { camera, families: [], isAlone: true });
        const oursRead = await readWitnessTargets(page, targetNames, true);
        return compare(referenceId, exportsRead, oursRead, page, camera);
      },
      () => close(),
    );
    measures.push(measure);
  }
  return { notes: measures.flatMap(({ notes }) => notes), readings: measures.flatMap(({ readings }) => readings) };
};
