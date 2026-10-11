import type { SettingsRowKind } from "#src/models/menu/SettingsRowKind";
import type { GameText, GameTextKey } from "genshin-text";

// A settings row, its label on the left and what its kind holds on the right: a choice's words in the reader's
// Language, an action's words, or a volume out of ten
export type SettingsRow = (
  | { getValue: (gameText: GameText) => string; kind: SettingsRowKind.Choice }
  | { kind: SettingsRowKind.Action; valueKey: GameTextKey }
  | { kind: SettingsRowKind.Quality }
  | { kind: SettingsRowKind.Slider; volume: number }
) & { labelKey: GameTextKey };
