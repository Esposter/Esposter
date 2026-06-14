import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";

import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { Direction } from "grid-engine";

export const checkIsUpdateThemeModeSetting = (input: PlayerInput, settingsOption: SettingsOption) =>
  settingsOption === SettingsOption["Theme Mode"] && (input === Direction.LEFT || input === Direction.RIGHT);
