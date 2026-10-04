import type { LoginCloudBand } from "#src/models/login/LoginCloudBand";

import { LoginTimeOfDay } from "#src/models/login/LoginTimeOfDay";

// The share of each band's clouds each hour's sky draws, solved on its title frame's cover band by band of its height
// Over the horizon (genshin:parity cover), the dusk's on the door recording, our clouds read at the recording's own
// Split between cloud and clear sky, with the bands' heights solved on every hour's frame at once. The day's and the
// Night's keep their former shares, since their solved shares score those frames worse: their clouds read grey and dark
// Where the recordings' are white and pale. The dusk's still leave 8 to 15 degrees under the recording's cover
export const LoginCloudCoverMap: Record<LoginTimeOfDay, Record<LoginCloudBand, number>> = {
  [LoginTimeOfDay.Dawn]: { bottom: 0.91, middle: 0.85, top: 0.94 },
  [LoginTimeOfDay.Day]: { bottom: 1, middle: 0.25, top: 0.15 },
  [LoginTimeOfDay.Dusk]: { bottom: 0.53, middle: 0.99, top: 0.93 },
  [LoginTimeOfDay.Night]: { bottom: 1, middle: 0.25, top: 0.15 },
};
