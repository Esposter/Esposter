import type { LoginCloudBand } from "#src/models/login/LoginCloudBand";

import { LoginTimeOfDay } from "#src/models/login/LoginTimeOfDay";

// The share of each band's clouds each hour's sky draws, solved on its title frame's cover band by band of its height
// Over the horizon (genshin:parity cover), the dusk's on the door recording, our clouds read at the recording's own
// Split between cloud and clear sky: the dawn's sky clear overhead. The dusk's shares still leave every band under the
// Recording's cover, our clouds standing less over their sky than its do
export const LoginCloudCoverMap: Record<LoginTimeOfDay, Record<LoginCloudBand, number>> = {
  [LoginTimeOfDay.Dawn]: { bottom: 1, middle: 1, top: 0 },
  [LoginTimeOfDay.Day]: { bottom: 1, middle: 0.25, top: 0.15 },
  [LoginTimeOfDay.Dusk]: { bottom: 0.54, middle: 0.81, top: 0.88 },
  [LoginTimeOfDay.Night]: { bottom: 1, middle: 0.25, top: 0.15 },
};
