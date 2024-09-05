import type { Grid } from "@/models/dungeons/Grid";
import type { Position } from "grid-engine";

import { useInputStore } from "@/lib/phaser/store/input";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import deepEqual from "fast-deep-equal";

export const useOnGridClick = <TValue, TGrid extends readonly (readonly TValue[])[]>(
  grid: Grid<TValue, TGrid>,
  position: MaybeRefOrGetter<Position>,
  onConfirm?: () => void,
) => {
  const inputStore = useInputStore();
  const { controls } = storeToRefs(inputStore);
  const defaultOnConfirm = () => {
    controls.value.setInput(PlayerSpecialInput.Confirm);
  };
  return () => {
    const positionValue = toValue(position);
    if (deepEqual(positionValue, grid.position.value)) (onConfirm ?? defaultOnConfirm)();
    else grid.position.value = positionValue;
  };
};
