import type { Position } from "grid-engine";

import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { SettingsOptionGrid } from "@/services/dungeons/scene/settings/SettingsOptionGrid";
import { useControlsStore } from "@/store/dungeons/controls";

export const useSettingsOnGridClick = (position: MaybeRefOrGetter<Position>) => {
  const controlsStore = useControlsStore();
  const { controls } = storeToRefs(controlsStore);
  return useOnGridClick(SettingsOptionGrid, position, () => {
    if (SettingsOptionGrid.value === SettingsOption.Close) controls.value.setInput(PlayerSpecialInput.Confirm);
  });
};
