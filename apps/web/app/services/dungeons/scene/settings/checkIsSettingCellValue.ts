import { SettingsOptionRows } from "#src/services/dungeons/scene/settings/SettingsOptionRows";

// Every value a value cell holds, read off the rows so the guard below cannot drift from what the menu draws
const SETTINGS_CELL_VALUES = SettingsOptionRows.flatMap(([, ...values]) => values);

// A saved setting is a cell's value only when it is one of these: a volume percentage and a theme mode are no cell's
export const checkIsSettingCellValue = (value: unknown): value is (typeof SETTINGS_CELL_VALUES)[number] =>
  SETTINGS_CELL_VALUES.some((cellValue) => cellValue === value);
