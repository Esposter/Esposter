import type { Position } from "grid-engine";

import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { SettingsOptionGrid } from "@/services/dungeons/scene/settings/SettingsOptionGrid";
import { useControlsStore } from "@/store/dungeons/controls";
import { useSettingsSceneStore } from "@/store/dungeons/settings/scene";
import { checkIsDeepEqual, getResultAsync, noop } from "@esposter/shared";

export const useSettingsOnGridClick = (position: MaybeRefOrGetter<Position>) => {
  const controlsStore = useControlsStore();
  const { controls } = storeToRefs(controlsStore);
  const settingsSceneStore = useSettingsSceneStore();
  const { selectSettingsPosition } = settingsSceneStore;
  return () => {
    const positionValue = toValue(position);
    // A click on the cell the cursor is already on is a second press, which only Close answers
    if (!checkIsDeepEqual(positionValue, SettingsOptionGrid.position.value))
      getResultAsync(() => selectSettingsPosition(positionValue)).match(noop, console.error);
    else if (SettingsOptionGrid.value === SettingsOption.Close) controls.value.setInput(PlayerSpecialInput.Confirm);
  };
};
