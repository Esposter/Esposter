import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/shared/ParityPassMeasure";

import { computeLightPlaneResidual } from "#src/services/genshinParity/display/computeLightPlaneResidual";
import { readDisplaySamples } from "#src/services/genshinParity/display/readDisplaySamples";
import { solveToneContrast } from "#src/services/genshinParity/display/solveToneContrast";
import { computeBloomReading } from "#src/services/genshinParity/passes/computeBloomReading";
import { BLOOM_READING_GATE, DISPLAY_CONTRAST_GATE, DISPLAY_WIDTH } from "#src/services/genshinParity/passes/constants";
import { getCurrentBuildReferenceIds } from "#src/services/genshinParity/passes/getCurrentBuildReferenceIds";
import { mergeParityPassMeasures } from "#src/services/genshinParity/passes/mergeParityPassMeasures";
import { readBloomFrames } from "#src/services/genshinParity/passes/readBloomFrames";
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
// Solves, so no reference measures it. The bloom's reading (`computeBloomReading`) follows, over each reference's brightest
// Pixels, our frame drawn with the game's bloom less ours drawn without it, gated at zero where the drawn bloom closes
export const measureDisplay = async (component: DerivedAssetComponent): Promise<ParityPassMeasure> => {
  await fetchReferences();
  const measures: ParityPassMeasure[] = [];
  const referenceIds = getCurrentBuildReferenceIds(component);
  for (const referenceId of referenceIds) {
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
  for (const referenceId of referenceIds) {
    // oxlint-disable-next-line no-await-in-loop -- one browser is open at a time
    const { bloomed, height, reference, unbloomed } = await readBloomFrames(referenceId, component);
    const reading = computeBloomReading(reference, bloomed, unbloomed, DISPLAY_WIDTH, height);
    measures.push({
      notes: [
        `${referenceId}: the drawn bloom less none reads ${reading.toFixed(3)} ΔE over the reference's brightest pixels, negative where it closes`,
      ],
      readings: [{ gate: BLOOM_READING_GATE, name: `${referenceId} bloom's reading`, unit: "ΔE", value: reading }],
    });
  }
  return mergeParityPassMeasures(measures);
};
