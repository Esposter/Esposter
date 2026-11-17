import type { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";

import { getSettingsRowY } from "#src/services/dungeons/scene/settings/getSettingsRowY";
import { SettingsOptionRows } from "#src/services/dungeons/scene/settings/SettingsOptionRows";

// The controls an option owns (the volume slider, the theme mode picker) sit on that option's own row
export const getSettingsOptionY = (settingsOption: SettingsOption) =>
  getSettingsRowY(SettingsOptionRows.findIndex(([rowOption]) => rowOption === settingsOption));
