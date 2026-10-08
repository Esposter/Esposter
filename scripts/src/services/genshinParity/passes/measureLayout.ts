import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";
import type { Vector } from "#src/models/shared/Vector";
import type { WitnessView } from "genshin-world/parity/models/witness/WitnessView";
import type { Page } from "playwright";

import { checkArrangement } from "#src/services/genshinAssets/scene/checkArrangement";
import { ARRANGEMENT_CROSS_RATIO_TOLERANCE } from "#src/services/genshinAssets/shared/constants";
import { computeLayoutFrameMeasure } from "#src/services/genshinParity/passes/computeLayoutFrameMeasure";
import { computeProjectedGaps } from "#src/services/genshinParity/passes/computeProjectedGaps";
import { PART_GATE_METRES } from "#src/services/genshinParity/passes/constants";
import { getCurrentBuildReferenceIds } from "#src/services/genshinParity/passes/getCurrentBuildReferenceIds";
import { openComponentWitnessPage } from "#src/services/genshinParity/passes/openComponentWitnessPage";
import { REFERENCES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { fromPageCamera } from "#src/services/genshinParity/shared/fromPageCamera";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { withFinalizerAsync } from "@esposter/shared";
import { join } from "node:path";
import sharp from "sharp";

const readFamilyOffsets = (page: Page): Promise<Record<string, Vector>> =>
  page.evaluate(() => (Reflect.get(window, "getWitnessFamilyOffsets") as () => Record<string, Vector>)());
const shift = (point: Readonly<Vector>, [x, y, z]: Readonly<Vector>): Vector => [
  point[0] + x,
  point[1] + y,
  point[2] + z,
];
// The layout pass: each ratio its references show between parts that meet against the fitted data's, each fitted
// Family's furthest part from the exports' objects it stands for, and how far across and up the scene stands each
// Family of the witness off its laid-out place past what the game's own data explains (along the glide is its motion);
// Then at each current build's reference, each fitted part and the export it stands for carried as the scene carries
// Their family in the reference's state, at every copy of a row it repeats the family along, and projected from the
// Scene's camera there, the furthest apart in the reference's own pixels (`computeLayoutFrameMeasure`). The camera is
// The next pass's, but both points of a pair move alike under a pose a little off, so their gap reads the placement
// Alone
export const measureLayout = async (component: DerivedAssetComponent): Promise<ParityPassMeasure> => {
  const { explainedOffsets, families, ratios } = await checkArrangement(component);
  const { browser, page } = await openComponentWitnessPage(component);
  const familyOffsets = await withFinalizerAsync(
    () => readFamilyOffsets(page),
    () => browser.close(),
  );
  const projected: { families: { gaps: number[]; name: string }[]; referenceId: string }[] = [];
  for (const referenceId of getCurrentBuildReferenceIds(component)) {
    // oxlint-disable-next-line no-await-in-loop -- one browser is open at a time
    const { browser: referenceBrowser, page: referencePage } = await openWitnessPage(referenceId, component);
    // oxlint-disable-next-line no-await-in-loop -- one browser is open at a time
    const referenceFamilies = await withFinalizerAsync(
      async () => {
        const [camera, offsets, { height, width }] = await Promise.all([
          referencePage.evaluate(() =>
            (Reflect.get(window, "getSceneCamera") as () => NonNullable<WitnessView["camera"]>)(),
          ),
          readFamilyOffsets(referencePage),
          sharp(join(REFERENCES_DIRECTORY, `${referenceId}.png`)).metadata(),
        ]);
        const pose = fromPageCamera(camera);
        return families.map(({ name, pairs, row: { count, length } }) => {
          const [x, y, z] = offsets[name] ?? [0, 0, 0];
          const shifted = Array.from({ length: count }, (_value, copy): Vector => [x, y, z + copy * length]).flatMap(
            (offset) =>
              pairs.map(({ expected, fitted }) => ({
                expected: shift(expected, offset),
                fitted: shift(fitted, offset),
              })),
          );
          return { gaps: computeProjectedGaps(pose, shifted, width, height), name };
        });
      },
      () => referenceBrowser.close(),
    );
    projected.push({ families: referenceFamilies, referenceId });
  }
  const frameMeasure = computeLayoutFrameMeasure(
    families.map(({ name }) => name),
    projected,
  );
  return {
    notes: [
      ...families.map(
        ({ mean, name, pairs }) => `${name}: ${pairs.length} fitted, ${mean.toFixed(2)} m from the exports on average`,
      ),
      ...frameMeasure.notes,
    ],
    readings: [
      ...ratios.map(({ fitted, measured, name }) => ({
        gate: ARRANGEMENT_CROSS_RATIO_TOLERANCE,
        name,
        unit: "cross-ratio",
        value: Math.abs(fitted - measured),
      })),
      ...families.map(({ largest, name }) => ({ gate: PART_GATE_METRES, name, unit: "m", value: largest })),
      ...Object.entries(familyOffsets).flatMap(([family, [x, y]]) => {
        const [explainedX, explainedY] = explainedOffsets[family] ?? [0, 0];
        return [
          { gate: PART_GATE_METRES, name: `${family} row across`, unit: "m", value: Math.abs(x - explainedX) },
          { gate: PART_GATE_METRES, name: `${family} row up`, unit: "m", value: Math.abs(y - explainedY) },
        ];
      }),
      ...frameMeasure.readings,
    ],
  };
};
