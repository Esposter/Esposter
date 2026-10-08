import type { SkyStatistics } from "#src/models/genshinParity/sky/SkyStatistics";

const formatLab = ([lightness = 0, a = 0, b = 0]: readonly number[]): string =>
  `L ${lightness.toFixed(1)} a ${a.toFixed(1)} b ${b.toFixed(1)}`;
const formatCover = ({ elevationCoverage }: SkyStatistics): string =>
  elevationCoverage.map((cover) => `${(cover * 100).toFixed(1)}%`).join(", ");
// A sky's statistics beside a reference's, in words for a note
export const formatSkyComparison = (ours: SkyStatistics, reference: SkyStatistics): string =>
  `cover by height ours ${formatCover(ours)} against ${formatCover(reference)}; clouds ${ours.clouds.contrast.toFixed(2)} times their sky against ${reference.clouds.contrast.toFixed(2)}, edges ${ours.clouds.edgeSharpness.toFixed(3)} against ${reference.clouds.edgeSharpness.toFixed(3)}, spread ${ours.clouds.spread.toFixed(3)} against ${reference.clouds.spread.toFixed(3)}, coloured ${formatLab(ours.cloudColour)} against ${formatLab(reference.cloudColour)}`;
