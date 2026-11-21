import type { PlayerInput } from "#src/models/dungeons/UI/input/PlayerInput";

import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { Direction } from "grid-engine-headless";

export const checkIsUpdateThemeModeSetting = (input: PlayerInput, settingsOption: SettingsOption) =>
  settingsOption === SettingsOption["Theme Mode"] && (input === Direction.Left || input === Direction.Right);
