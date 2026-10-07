import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";

import { WitnessTargetName } from "#src/models/genshinParity/shared/WitnessTargetName";
import { compareFamilyTargets } from "#src/services/genshinParity/passes/compareFamilyTargets";
import {
  SHAPE_DEPTH_GATE,
  SHAPE_NORMAL_GATE_DEGREES,
  SHAPE_OUTLINE_GATE_PIXELS,
  SHAPE_WIDTH,
} from "#src/services/genshinParity/passes/constants";
import { getCurrentBuildReferenceIds } from "#src/services/genshinParity/passes/getCurrentBuildReferenceIds";
import { solveReferenceCamera } from "#src/services/genshinParity/passes/solveReferenceCamera";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { readWitnessTargets } from "#src/services/genshinParity/shared/readWitnessTargets";
import { setPageWitnessView } from "#src/services/genshinParity/shared/setPageWitnessView";
import { toPageCamera } from "#src/services/genshinParity/shared/toPageCamera";
import { withFinalizerAsync } from "@esposter/shared";

const TARGET_NAMES = [WitnessTargetName.Part, WitnessTargetName.Depth, WitnessTargetName.Normal];
// The shape pass: each family of ours drawn into the same targets as the exports' it stands for, at each current
// Build's reference's camera (`solveReferenceCamera`), and compared target by target (`compareFamilyTargets`): its
// Outline in pixels at the shape's width, and where both draw it, its depth's gap as a share and its normals' angle
export const measureShape = async (component: DerivedAssetComponent): Promise<ParityPassMeasure> => {
  await fetchReferences();
  const measures: ParityPassMeasure[] = [];
  for (const referenceId of getCurrentBuildReferenceIds(component)) {
    // oxlint-disable-next-line no-await-in-loop -- one browser is open at a time
    const { browser, page } = await openWitnessPage(referenceId, component, SHAPE_WIDTH);
    // oxlint-disable-next-line no-await-in-loop -- one browser is open at a time
    const measure = await withFinalizerAsync(
      async () => {
        const { pose } = await solveReferenceCamera(page, referenceId, component);
        const camera = toPageCamera(pose);
        await setPageWitnessView(page, { camera, isAlone: true });
        const exportsRead = await readWitnessTargets(page, TARGET_NAMES);
        await setPageWitnessView(page, { camera, families: [], isAlone: true });
        const oursRead = await readWitnessTargets(page, TARGET_NAMES, true);
        const toTargets = ({
          targets,
        }: typeof exportsRead): { depth: Float32Array; normal: Float32Array; part: Float32Array } => ({
          depth: targets.depth ?? new Float32Array(),
          normal: targets.normal ?? new Float32Array(),
          part: targets.part ?? new Float32Array(),
        });
        const comparisons = compareFamilyTargets(
          toTargets(exportsRead),
          toTargets(oursRead),
          exportsRead.width,
          exportsRead.families.length,
        );
        return {
          notes: [],
          readings: comparisons.flatMap(({ depth, family, normal, outline }) => {
            const name = `${referenceId} ${exportsRead.families[family] ?? family}`;
            return [
              { gate: SHAPE_OUTLINE_GATE_PIXELS, name: `${name} outline`, unit: "px", value: outline },
              { gate: SHAPE_DEPTH_GATE, name: `${name} depth`, unit: "share", value: depth },
              { gate: SHAPE_NORMAL_GATE_DEGREES, name: `${name} normal`, unit: "degrees", value: normal },
            ];
          }),
        };
      },
      () => browser.close(),
    );
    measures.push(measure);
  }
  return { notes: measures.flatMap(({ notes }) => notes), readings: measures.flatMap(({ readings }) => readings) };
};
