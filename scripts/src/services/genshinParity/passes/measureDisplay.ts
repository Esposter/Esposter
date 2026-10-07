import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";

import { computeLightPlaneResidual } from "#src/services/genshinParity/display/computeLightPlaneResidual";
import { readDisplaySamples } from "#src/services/genshinParity/display/readDisplaySamples";
import { solveToneContrast } from "#src/services/genshinParity/display/solveToneContrast";
import { DISPLAY_CONTRAST_GATE } from "#src/services/genshinParity/passes/constants";
import { getCurrentBuildReferenceIds } from "#src/services/genshinParity/passes/getCurrentBuildReferenceIds";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { GENSHIN_TONE_CONTRAST } from "genshin-engine";

// A pixel is read where its colour stands clear of the curve's black in every channel, where the curve still tells
// One light from the next
const MIN_DISPLAY = 0.01;
// Any two lights lie on a plane through black, so fewer pixels than three lay flat under every contrast
const MIN_SAMPLE_COUNT = 3;
// The display pass: at each current build's reference's camera, every interior pixel of the exports' parts
// (`readDisplaySamples`), and the tone curve's contrast its light lies flattest under (`solveToneContrast`). Its reading
// Is how much more the shipped contrast leaves than that one, gated where the profile's other values stand well apart,
// And a reference with too few pixels to read fails it. The curve's exposure only scales the light the light pass
// Solves, so no reference measures it
export const measureDisplay = async (component: DerivedAssetComponent): Promise<ParityPassMeasure> => {
  await fetchReferences();
  const measures: ParityPassMeasure[] = [];
  for (const referenceId of getCurrentBuildReferenceIds(component)) {
    // oxlint-disable-next-line no-await-in-loop -- one browser is open at a time
    const samples = await readDisplaySamples(referenceId, component, MIN_DISPLAY);
    if (samples.length < MIN_SAMPLE_COUNT) {
      measures.push({
        notes: [`${referenceId}: ${samples.length} pixels qualify, too few to measure its contrast`],
        readings: [
          { gate: DISPLAY_CONTRAST_GATE, name: `${referenceId} contrast's excess`, unit: "share", value: Infinity },
        ],
      });
      continue;
    }
    // oxlint-disable-next-line no-await-in-loop -- each reference's solve is read in turn
    const { contrast, residual } = await solveToneContrast(samples);
    const shippedResidual = computeLightPlaneResidual(samples, GENSHIN_TONE_CONTRAST);
    measures.push({
      notes: [
        `${referenceId}: ${samples.length} pixels lie flattest at contrast ${contrast.toFixed(3)}, residual ${residual.toExponential(3)}; the shipped ${GENSHIN_TONE_CONTRAST} leaves ${shippedResidual.toExponential(3)}`,
      ],
      readings: [
        {
          gate: DISPLAY_CONTRAST_GATE,
          name: `${referenceId} contrast's excess`,
          unit: "share",
          value: residual === 0 ? 0 : (shippedResidual - residual) / residual,
        },
      ],
    });
  }
  return { notes: measures.flatMap(({ notes }) => notes), readings: measures.flatMap(({ readings }) => readings) };
};
