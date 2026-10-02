import type { LoginCloudBand } from "#src/models/login/LoginCloudBand";

import { LoginTimeOfDay } from "#src/models/login/LoginTimeOfDay";

// The share of each band's clouds each hour's sky draws, solved on its title frame's cover band by band of its height
// Over the horizon (genshin:parity cover), the dusk's on the door recording: the dawn's sky clear overhead, the dusk's
// Clouded almost whole
export const LoginCloudCoverMap: Record<LoginTimeOfDay, Record<LoginCloudBand, number>> = {
  [LoginTimeOfDay.Dawn]: { bottom: 1, middle: 1, top: 0 },
  [LoginTimeOfDay.Day]: { bottom: 1, middle: 0.25, top: 0.15 },
  [LoginTimeOfDay.Dusk]: { bottom: 0.22, middle: 0.95, top: 0.91 },
  [LoginTimeOfDay.Night]: { bottom: 1, middle: 0.25, top: 0.15 },
};
