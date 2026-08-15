import { INITIAL_SETTINGS_POSITION, SETTINGS_POSITION_INCREMENT } from "@/services/dungeons/scene/settings/constants";

// One row per settings option, evenly spaced down the menu
export const getSettingsRowY = (rowIndex: number) =>
  INITIAL_SETTINGS_POSITION.y + SETTINGS_POSITION_INCREMENT.y * rowIndex;
