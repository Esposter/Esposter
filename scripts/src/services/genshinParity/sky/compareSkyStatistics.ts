import type { SkyDistance } from "#src/models/genshinParity/sky/SkyDistance";
import type { SkyStatistics } from "#src/models/genshinParity/sky/SkyStatistics";

// How far apart two skies' statistics stand (`SkyDistance`)
export const compareSkyStatistics = (first: SkyStatistics, second: SkyStatistics): SkyDistance => {
  const [firstLightness, firstA, firstB] = first.clearColour;
  const [secondLightness, secondA, secondB] = second.clearColour;
  const coverGaps = first.elevationCoverage.map((cover, band) =>
    Math.abs(cover - (second.elevationCoverage[band] ?? 0)),
  );
  return {
    brightness: Math.abs(
      Math.log(Math.max(first.clouds.contrast, Number.EPSILON) / Math.max(second.clouds.contrast, Number.EPSILON)),
    ),
    colour: Math.hypot(firstLightness - secondLightness, firstA - secondA, firstB - secondB),
    cover: coverGaps.reduce((sum, gap) => sum + gap, 0) / Math.max(coverGaps.length, 1),
    edgeSharpness: Math.abs(first.clouds.edgeSharpness - second.clouds.edgeSharpness),
    spread: Math.abs(first.clouds.spread - second.clouds.spread),
  };
};
