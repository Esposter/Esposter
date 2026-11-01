import type { SettingsRow } from "#src/models/menu/SettingsRow";
import type { SettingsRowKind } from "#src/models/menu/SettingsRowKind";

// A settings row the track draws: a range or a volume the world backs with a setting, or a slider it does not back,
// Drawn at the value it holds
export type SettingsTrackRow = Extract<
  SettingsRow,
  { kind: SettingsRowKind.Range | SettingsRowKind.Slider | SettingsRowKind.Volume }
>;
