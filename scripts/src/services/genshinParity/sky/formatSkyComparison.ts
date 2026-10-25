import type { SkyStatistics } from "#src/models/genshinParity/sky/SkyStatistics";

import { formatCover } from "#src/services/genshinParity/sky/formatCover";
import { formatLab } from "#src/services/genshinParity/sky/formatLab";

// A sky's statistics beside a reference's, in words for a note
export const formatSkyComparison = (ours: SkyStatistics, reference: SkyStatistics): string =>
  `cover by height ours ${formatCover(ours)} against ${formatCover(reference)}; clouds ${ours.clouds.contrast.toFixed(2)} times their sky against ${reference.clouds.contrast.toFixed(2)}, edges ${ours.clouds.edgeSharpness.toFixed(3)} against ${reference.clouds.edgeSharpness.toFixed(3)}, spread ${ours.clouds.spread.toFixed(3)} against ${reference.clouds.spread.toFixed(3)}, coloured ${formatLab(ours.cloudColour)} against ${formatLab(reference.cloudColour)}`;
