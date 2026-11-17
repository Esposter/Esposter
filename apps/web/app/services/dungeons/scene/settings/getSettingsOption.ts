import { SettingsOptionRows } from "#src/services/dungeons/scene/settings/SettingsOptionRows";
import { takeOne } from "@esposter/shared";

// Column 0 of a row is its option, and the rows are typed, so the option needs no cast from the grid's cell type
export const getSettingsOption = (rowIndex: number) => takeOne(SettingsOptionRows, rowIndex)[0];
