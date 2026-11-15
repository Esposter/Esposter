import type { Grid } from "#src/models/dungeons/Grid";
import type { Position } from "grid-engine";

import { PlayerSpecialInput } from "#src/models/dungeons/UI/input/PlayerSpecialInput";
import { useControlsStore } from "#src/store/dungeons/controls";
import { checkIsDeepEqual } from "@esposter/shared";

export const useOnGridClick = <TGrid extends readonly (readonly unknown[])[]>(
  grid: Grid<TGrid>,
  position: MaybeRefOrGetter<Position>,
  { onConfirm, onMove }: { onConfirm?: () => void; onMove?: (position: Position) => void } = {},
) => {
  const controlsStore = useControlsStore();
  const { controls } = storeToRefs(controlsStore);
  const defaultOnConfirm = () => {
    controls.value.setInput(PlayerSpecialInput.Confirm);
  };
  const defaultOnMove = (positionValue: Position) => {
    grid.position.value = positionValue;
  };
  return () => {
    const positionValue = toValue(position);
    if (checkIsDeepEqual(positionValue, grid.position.value)) (onConfirm ?? defaultOnConfirm)();
    else (onMove ?? defaultOnMove)(positionValue);
  };
};
