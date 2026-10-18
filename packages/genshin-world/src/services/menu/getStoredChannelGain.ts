import type { VolumeSetting } from "#src/models/menu/VolumeSetting";

import { getChannelGain } from "#src/services/menu/getChannelGain";
import { getStoredGenshinSettings } from "#src/services/menu/getStoredGenshinSettings";

// The gain a channel plays at as the device keeps it now, for the sounds that start outside the Settings screen. A
// Blocked store is logged and read as no stored settings, so the sound plays at its default level
export const getStoredChannelGain = (channel: VolumeSetting.Music | VolumeSetting.Sfx): number =>
  getChannelGain(getStoredGenshinSettings(), channel);
