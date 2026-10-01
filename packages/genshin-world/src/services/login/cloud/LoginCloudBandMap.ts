import type clouds from "#src/data/login/clouds.json";
import type { CloudBandOptions } from "genshin-engine";

type LoginCloudBand = keyof typeof clouds;
// Each of the login sky's three cloud emitters as a band of its own atlas's clouds. The emitters' own counts and
// Spreads are their scripts' and never exported, so each band is measured off the captures: the cloud sea's billows
// Heaped from the cloud layer the blocks place 17.5 metres under the walkway up to just under its surface, spread to the
// Horizon; the middle cumulus behind the towers' shafts; the top cumulus high over their crowns
export const LoginCloudBandMap: Record<LoginCloudBand, CloudBandOptions> = {
  bottom: { count: 420, distanceRange: [10, 600], heightRange: [-17.5, -4.5], seed: 1, widthRange: [17.5, 45] },
  middle: { count: 60, distanceRange: [100, 400], heightRange: [35, 105], seed: 2, widthRange: [65, 130] },
  top: { count: 36, distanceRange: [75, 350], heightRange: [105, 205], seed: 3, widthRange: [80, 160] },
};
