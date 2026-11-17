import type { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import type { useSettingsSceneStore } from "#src/store/dungeons/settings/scene";

import { NotFoundError } from "@esposter/shared";
import { describe } from "vitest";

// The grid comes in from the suite, which reads it off the store
// A helper that imported the store would load Phaser when vitest runs this file
export const getRowPosition = (
  settingsOptionGrid: ReturnType<typeof useSettingsSceneStore>["settingsOptionGrid"],
  settingsOption: SettingsOption,
) => {
  const position = settingsOptionGrid.getPosition(settingsOption);
  if (!position) throw new NotFoundError(getRowPosition.name, settingsOption);

  return position;
};

describe.todo("getRowPosition");
