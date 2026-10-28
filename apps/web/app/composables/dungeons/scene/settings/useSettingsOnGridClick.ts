import type { Position } from "grid-engine";

import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { SettingsOptionGrid } from "@/services/dungeons/scene/settings/SettingsOptionGrid";
import { useControlsStore } from "@/store/dungeons/controls";
import { useSettingsSceneStore } from "@/store/dungeons/settings/scene";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";

export const useSettingsOnGridClick = (position: MaybeRefOrGetter<Position>) => {
  const controlsStore = useControlsStore();
  const { controls } = storeToRefs(controlsStore);
  const settingsSceneStore = useSettingsSceneStore();
  const { selectSettingsPosition } = settingsSceneStore;
  // A click on the cell the cursor is already on is a second press, which only Close answers. Any other click moves the
  // Cursor by way of the store, since a value cell saves what it lands on
  return useOnGridClick(SettingsOptionGrid, position, {
    onConfirm: () => {
      if (SettingsOptionGrid.value === SettingsOption.Close) controls.value.setInput(PlayerSpecialInput.Confirm);
    },
    onMove: (positionValue) => {
      getSynchronizedFunction(() =>
        getResultAsync(() => selectSettingsPosition(positionValue)).match(noop, console.error),
      )();
    },
  });
};
