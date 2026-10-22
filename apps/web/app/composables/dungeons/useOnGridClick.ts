import type { Grid } from "@/models/dungeons/Grid";
import type { Position } from "grid-engine";

import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { useControlsStore } from "@/store/dungeons/controls";
import { checkIsDeepEqual } from "@esposter/shared";

export const useOnGridClick = <TGrid extends readonly (readonly unknown[])[]>(
  grid: Grid<TGrid>,
  position: MaybeRefOrGetter<Position>,
) => {
  const controlsStore = useControlsStore();
  const { controls } = storeToRefs(controlsStore);
  return () => {
    const positionValue = toValue(position);
    if (checkIsDeepEqual(positionValue, grid.position.value)) controls.value.setInput(PlayerSpecialInput.Confirm);
    else grid.position.value = positionValue;
  };
};
