import type { RangeSetting } from "#src/models/menu/RangeSetting";
import type { SettingRange } from "#src/models/menu/SettingRange";
import type { SettingsRowKind } from "#src/models/menu/SettingsRowKind";
import type { ToggleSetting } from "#src/models/menu/ToggleSetting";
import type { VolumeSetting } from "#src/models/menu/VolumeSetting";
import type { GameLanguage, GameText, GameTextKey } from "genshin-text";

// A settings row, its label on the left and what its kind holds on the right: a choice's words in the reader's language,
// An action's words, a list of the world's own (the quality or the game language), a range or a volume the world sets
// Across its track, a slider the world does not back, drawn at its value on that track, or a toggle the world flips
export type SettingsRow = (
  | { getValue: (gameText: GameText, language: GameLanguage) => string; kind: typeof SettingsRowKind.Choice }
  | { kind: typeof SettingsRowKind.Action; valueKey: GameTextKey }
  | { kind: typeof SettingsRowKind.Language }
  | { kind: typeof SettingsRowKind.Quality }
  | { kind: typeof SettingsRowKind.Range; range: SettingRange; setting: RangeSetting }
  | { kind: typeof SettingsRowKind.Slider; range: SettingRange; value: number }
  | { kind: typeof SettingsRowKind.Toggle; setting: ToggleSetting }
  | { kind: typeof SettingsRowKind.Volume; range: SettingRange; setting: VolumeSetting }
) & { labelKey: GameTextKey };
