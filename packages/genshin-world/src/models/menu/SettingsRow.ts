import type { SettingsRowKind } from "#src/models/menu/SettingsRowKind";
import type { VolumeSetting } from "#src/models/menu/VolumeSetting";
import type { GameLanguage, GameText, GameTextKey } from "genshin-text";

// A settings row, its label on the left and what its kind holds on the right: a choice's words in the reader's language,
// An action's words, a list of the world's own (the quality or the game language), a volume the world sets, or a volume
// The world does not back, drawn at its level
export type SettingsRow = (
  | { getValue: (gameText: GameText, language: GameLanguage) => string; kind: SettingsRowKind.Choice }
  | { kind: SettingsRowKind.Action; valueKey: GameTextKey }
  | { kind: SettingsRowKind.Language }
  | { kind: SettingsRowKind.Quality }
  | { kind: SettingsRowKind.Slider; volume: number }
  | { kind: SettingsRowKind.Volume; setting: VolumeSetting }
) & { labelKey: GameTextKey };
