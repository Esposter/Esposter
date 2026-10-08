import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";
import type { StoneLight } from "genshin-engine";

import { readWorldData } from "#src/services/genshinAssets/shared/readWorldData";
import { COLOUR_GATE } from "#src/services/genshinParity/passes/constants";
import { getCurrentBuildReferenceIds } from "#src/services/genshinParity/passes/getCurrentBuildReferenceIds";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { STONE_LIGHT_PATH } from "#src/services/genshinParity/witness/constants";
import { readReferenceStoneSamples } from "#src/services/genshinParity/witness/readReferenceStoneSamples";
import { readStoneColourDistance } from "#src/services/genshinParity/witness/readStoneColourDistance";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The light pass: at each current build's reference's camera, the stone light written for its hour cast over the
// Exports' stone and shown through the white balance and the tone curve, against the reference's stone, bin by bin
// (`readStoneColourDistance`). It is gated where two colours side by side are just told apart, or at what the same light
// Reads against our own render of the exports under it, whichever is wider, since the light's model leaves out what the
// Render draws beside it (the normal maps, the highlight) and no light read through it comes nearer than that
export const measureLight = async (component: DerivedAssetComponent): Promise<ParityPassMeasure> => {
  const lights = await readWorldData<Record<string, StoneLight>>(STONE_LIGHT_PATH);
  const measures: ParityPassMeasure[] = [];
  for (const referenceId of getCurrentBuildReferenceIds(component)) {
    const timeOfDay = ParityReferenceMap[referenceId]?.props?.timeOfDay;
    const light = typeof timeOfDay === "string" ? lights[timeOfDay] : undefined;
    if (!light) throw new InvalidOperationError(Operation.Read, STONE_LIGHT_PATH, `no light for ${referenceId}`);
    // oxlint-disable-next-line no-await-in-loop -- one browser is open at a time
    const reference = await readReferenceStoneSamples(referenceId, component);
    // oxlint-disable-next-line no-await-in-loop -- one browser is open at a time
    const self = await readReferenceStoneSamples(referenceId, component, true);
    const { distance, heights } = readStoneColourDistance(reference.samples, light, reference.whiteBalance);
    const floor = readStoneColourDistance(self.samples, light, self.whiteBalance).distance;
    measures.push({
      notes: [
        `${referenceId} stone colour by height, up to each top: ${heights.map(({ count, distance: heightDistance, top }) => `${top} m ${heightDistance.toFixed(1)} over ${count}`).join(", ")}; our render under the same light reads ${floor.toFixed(1)}`,
      ],
      readings: [
        { gate: Math.max(COLOUR_GATE, floor), name: `${referenceId} stone colour`, unit: "ΔE", value: distance },
      ],
    });
  }
  return { notes: measures.flatMap(({ notes }) => notes), readings: measures.flatMap(({ readings }) => readings) };
};
