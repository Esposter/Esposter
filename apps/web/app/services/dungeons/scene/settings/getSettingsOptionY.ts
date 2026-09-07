import type { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";

import { getSettingsRowY } from "@/services/dungeons/scene/settings/getSettingsRowY";
import { SettingsOptionGrid } from "@/services/dungeons/scene/settings/SettingsOptionGrid";

// The controls an option owns (the volume slider, the theme mode picker) sit on that option's own row
export const getSettingsOptionY = (settingsOption: SettingsOption) =>
  getSettingsRowY(SettingsOptionGrid.getPosition(settingsOption)?.y ?? 0);
