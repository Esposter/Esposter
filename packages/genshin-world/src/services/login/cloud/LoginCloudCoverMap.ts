import type { LoginCloudBand } from "#src/models/login/LoginCloudBand";

import { LoginTimeOfDay } from "#src/models/login/LoginTimeOfDay";

// The share of each band's clouds each hour's sky draws, solved on its title frame's cover band by band of its height
// Over the horizon (genshin:parity cover), the dusk's on the door recording: the recording's clouds read at its own
// Split between cloud and clear sky, ours where they move our sky from the same sky drawn with none, whatever their
// Colour, with the bands' heights solved on every hour's frame at once
export const LoginCloudCoverMap: Record<LoginTimeOfDay, Record<LoginCloudBand, number>> = {
  [LoginTimeOfDay.Dawn]: { bottom: 0.94, middle: 0.71, top: 0.03 },
  [LoginTimeOfDay.Day]: { bottom: 0.99, middle: 0.53, top: 0.02 },
  [LoginTimeOfDay.Dusk]: { bottom: 0.38, middle: 1, top: 0.5 },
  [LoginTimeOfDay.Night]: { bottom: 0.99, middle: 0.06, top: 0.13 },
};
