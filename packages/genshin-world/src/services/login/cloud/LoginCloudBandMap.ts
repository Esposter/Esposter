import type clouds from "#src/data/login/clouds.json";
import type { CloudBandOptions } from "genshin-engine";

type LoginCloudBand = keyof typeof clouds;
// Each of the login sky's three cloud emitters as a band of its own atlas's clouds. The emitters' own counts and
// Spreads are their scripts' and never exported, so each band is measured off the captures: the cloud sea's billows
// Heaped from the cloud layer the blocks place 70 metres under the walkway up to just under its surface, spread to the
// Horizon; the middle cumulus behind the towers' shafts; the top cumulus high over their crowns
export const LoginCloudBandMap: Record<LoginCloudBand, CloudBandOptions> = {
  bottom: { count: 420, distanceRange: [40, 2400], heightRange: [-70, -18], seed: 1, widthRange: [70, 180] },
  middle: { count: 60, distanceRange: [400, 1600], heightRange: [140, 420], seed: 2, widthRange: [260, 520] },
  top: { count: 36, distanceRange: [300, 1400], heightRange: [420, 820], seed: 3, widthRange: [320, 640] },
};
