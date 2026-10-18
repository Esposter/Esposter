import type { GenshinSettings } from "#src/models/menu/GenshinSettings";

import { VolumeSetting } from "#src/models/menu/VolumeSetting";
import { VOLUME_LEVEL_MAXIMUM } from "#src/services/menu/constants";

// The gain a channel plays at: its own level as a share of the highest, through the overall Volume the same way, as the
// Game's rows multiply. Provisional: a linear share, since the wiki gives the ranges and not the curve between them
export const getChannelGain = (settings: GenshinSettings, channel: VolumeSetting.Music | VolumeSetting.Sfx): number =>
  (settings[VolumeSetting.Master] / VOLUME_LEVEL_MAXIMUM) * (settings[channel] / VOLUME_LEVEL_MAXIMUM);
