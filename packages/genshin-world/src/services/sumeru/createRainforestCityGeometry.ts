import type { RainforestCityOptions } from "#src/models/sumeru/RainforestCityOptions";
import type { LatheSection } from "genshin-engine";
import type { BufferGeometry } from "three";

import { createLatheStackGeometry } from "genshin-engine";

// The dome is stepped through as many rings as this, each at the radius of a hemisphere's ring at that height
const DOME_STEP_COUNT = 6;

// Sumeru City's terraces as one stacked lathe for one material: each tier a drum with a walkway ledge on its top that
// Overhangs it, and a dome standing on the highest tier's ledge. Standing on the origin, merged into one geometry
export const createRainforestCityGeometry = ({
  baseRadius,
  domeHeight,
  domeRadius,
  radialSegments,
  radiusStep,
  tierCount,
  tierHeight,
  walkwayHeight,
  walkwayOverhang,
}: RainforestCityOptions): BufferGeometry => {
  const sections: LatheSection[] = [];
  for (let tier = 0; tier < tierCount; tier++) {
    const tierRadius = baseRadius - tier * radiusStep;
    const walkwayRadius = tierRadius + walkwayOverhang;
    sections.push({ bottomRadius: tierRadius, height: tierHeight, topRadius: tierRadius });
    sections.push({ bottomRadius: walkwayRadius, height: walkwayHeight, topRadius: walkwayRadius });
  }
  const domeStepHeight = domeHeight / DOME_STEP_COUNT;
  const getDomeRingRadius = (step: number): number => domeRadius * Math.sqrt(1 - (step / DOME_STEP_COUNT) ** 2);
  for (let step = 0; step < DOME_STEP_COUNT; step++)
    sections.push({
      bottomRadius: getDomeRingRadius(step),
      height: domeStepHeight,
      topRadius: getDomeRingRadius(step + 1),
    });
  return createLatheStackGeometry({ isFaceted: false, radialSegments, sections });
};
