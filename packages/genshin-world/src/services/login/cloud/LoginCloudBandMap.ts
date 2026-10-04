import type { LoginCloudBand } from "#src/models/login/LoginCloudBand";
import type { CloudBandOptions } from "genshin-engine";

// Each of the login sky's three cloud emitters as a band of its own atlas's clouds. The emitters' own counts and
// Spreads are their scripts' and never exported, so each band is measured off the captures: the cloud sea's billows
// Spread to the horizon under the walkway; the middle cumulus as a bank along the horizon behind the towers, 150 to 450
// Out; the top cumulus over their crowns. The heights each band stands between are one scene's for every hour, so they
// Are solved on the dawn's, the day's, the dusk's and the night's frames at once by the sky's cover band by band of its
// Height over the horizon, each hour's shares solved again under them by turns (genshin:parity cover --heights)
export const LoginCloudBandMap: Record<LoginCloudBand, CloudBandOptions> = {
  bottom: { count: 420, distanceRange: [10, 600], heightRange: [-17.3, -6.7], seed: 1, widthRange: [17.5, 45] },
  middle: { count: 240, distanceRange: [150, 450], heightRange: [-23.6, 9.8], seed: 2, widthRange: [65, 130] },
  top: { count: 240, distanceRange: [75, 350], heightRange: [31.6, 396.9], seed: 3, widthRange: [80, 160] },
};
