import type { GenshinSettings } from "#src/models/menu/GenshinSettings";
import type { SettingsTrackRow } from "#src/models/menu/SettingsTrackRow";

import { SettingsRowKind } from "#src/models/menu/SettingsRowKind";

// The value a track row is at: the setting a range or a volume is backed with, or the value an unbacked slider holds
export const getTrackValue = (row: SettingsTrackRow, settings: GenshinSettings): number =>
  row.kind === SettingsRowKind.Slider ? row.value : settings[row.setting];
