import type { SettingsRow } from "#src/models/menu/SettingsRow";
import type { GameTextKey } from "genshin-text";

// A run of a tab's rows under their heading
export interface SettingsSection {
  headingKey: GameTextKey;
  rows: SettingsRow[];
}
