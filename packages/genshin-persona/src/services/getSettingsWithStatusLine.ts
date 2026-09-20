import type { UserSettings } from "#src/models/UserSettings";

import { checkIsPluginStatusLine } from "#src/services/checkIsPluginStatusLine";
import { getPluginStatusLine } from "#src/services/getPluginStatusLine";

// A status line that is not ours is left alone: unlike the spinner, replacing it would lose something the person wrote
export const getSettingsWithStatusLine = (settings: UserSettings): UserSettings => {
  const isForeignStatusLine = Boolean(settings.statusLine) && !checkIsPluginStatusLine(settings.statusLine);
  return { ...settings, statusLine: isForeignStatusLine ? settings.statusLine : getPluginStatusLine() };
};
