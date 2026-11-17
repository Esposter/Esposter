import type { Position } from "grid-engine";

import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { PlayerSpecialInput } from "#src/models/dungeons/UI/input/PlayerSpecialInput";
import { useControlsStore } from "#src/store/dungeons/controls";
import { useSettingsSceneStore } from "#src/store/dungeons/settings/scene";

export const useSettingsOnGridClick = (position: MaybeRefOrGetter<Position>) => {
  const controlsStore = useControlsStore();
  const { controls } = storeToRefs(controlsStore);
  const settingsSceneStore = useSettingsSceneStore();
  const { selectSettingsPosition, settingsOptionGrid } = settingsSceneStore;
  // A click on the cell the cursor is already on is a second press, which only Close answers. Any other click moves the
  // Cursor by way of the store, since a value cell saves what it lands on
  return useOnGridClick(settingsOptionGrid, position, {
    onConfirm: () => {
      if (settingsOptionGrid.value === SettingsOption.Close) controls.value.setInput(PlayerSpecialInput.Confirm);
    },
    onMove: (positionValue) => {
      selectSettingsPosition(positionValue);
    },
  });
};
