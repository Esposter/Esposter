import type { Settings } from "#shared/models/dungeons/data/settings/Settings";
import type { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";

import { settingsSchema } from "#shared/models/dungeons/data/settings/Settings";

// Close is the one option that saves no setting of its own, so it is the one a settings key does not name
export const checkIsSettingsOptionWithValue = (settingsOption: SettingsOption): settingsOption is keyof Settings =>
  settingsOption in settingsSchema.shape;
