import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";
import type { Vector } from "#src/models/shared/Vector";
import type { WitnessView } from "genshin-world/parity/models/witness/WitnessView";
import type { Page } from "playwright";

import { checkArrangement } from "#src/services/genshinAssets/scene/checkArrangement";
import { ARRANGEMENT_CROSS_RATIO_TOLERANCE } from "#src/services/genshinAssets/shared/constants";
import { computeProjectedGaps } from "#src/services/genshinParity/passes/computeProjectedGaps";
import { FRAME_GATE_PIXELS, PART_GATE_METRES } from "#src/services/genshinParity/passes/constants";
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
// Their family in the reference's state and projected from the scene's camera there, the furthest apart in the
// Reference's own pixels. The camera is the next pass's, but both points of a pair move alike under a pose a little
// Off, so their gap reads the placement alone
export const measureLayout = async (component: DerivedAssetComponent): Promise<ParityPassMeasure> => {
  const { explainedOffsets, families, ratios } = await checkArrangement(component);
  const { browser, page } = await openComponentWitnessPage(component);
  const familyOffsets = await withFinalizerAsync(
    () => readFamilyOffsets(page),
    () => browser.close(),
  );
  const projected: ParityPassMeasure[] = [];
  for (const referenceId of getCurrentBuildReferenceIds(component)) {
    // oxlint-disable-next-line no-await-in-loop -- one browser is open at a time
    const { browser: referenceBrowser, page: referencePage } = await openWitnessPage(referenceId, component);
    // oxlint-disable-next-line no-await-in-loop -- one browser is open at a time
    const measure = await withFinalizerAsync(
      async (): Promise<ParityPassMeasure> => {
        const [camera, offsets, { height, width }] = await Promise.all([
          referencePage.evaluate(() =>
            (Reflect.get(window, "getSceneCamera") as () => NonNullable<WitnessView["camera"]>)(),
          ),
          readFamilyOffsets(referencePage),
          sharp(join(REFERENCES_DIRECTORY, `${referenceId}.png`)).metadata(),
        ]);
        const pose = fromPageCamera(camera);
        const familyGaps = families.map(({ name, pairs }) => {
          const offset = offsets[name] ?? [0, 0, 0];
          const shifted = pairs.map(({ expected, fitted }) => ({
            expected: shift(expected, offset),
            fitted: shift(fitted, offset),
          }));
          return { gaps: computeProjectedGaps(pose, shifted, width, height), name };
        });
        return {
          notes: familyGaps
            .filter(({ gaps }) => gaps.length === 0)
            .map(({ name }) => `${referenceId} ${name}: no part on the frame`),
          readings: familyGaps
            .filter(({ gaps }) => gaps.length > 0)
            .map(({ gaps, name }) => ({
              gate: FRAME_GATE_PIXELS,
              name: `${referenceId} ${name}`,
              unit: "px",
              value: Math.max(...gaps),
            })),
        };
      },
      () => referenceBrowser.close(),
    );
    projected.push(measure);
  }
  return {
    notes: [
      ...families.map(
        ({ mean, name, pairs }) => `${name}: ${pairs.length} fitted, ${mean.toFixed(2)} m from the exports on average`,
      ),
      ...projected.flatMap(({ notes }) => notes),
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
      ...projected.flatMap(({ readings }) => readings),
    ],
  };
};
