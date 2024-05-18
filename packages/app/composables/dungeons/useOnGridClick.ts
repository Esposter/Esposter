import { useInputStore } from "@/lib/phaser/store/input";
import type { Grid } from "@/models/dungeons/Grid";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import deepEqual from "deep-equal";
import type { Position } from "grid-engine";

export const useOnGridClick = <TValue, TGrid extends readonly (readonly TValue[])[]>(
  grid: Ref<Grid<TValue, TGrid>>,
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
    if (deepEqual(positionValue, grid.value.position)) (onConfirm ?? defaultOnConfirm)();
    else grid.value.position = positionValue;
  };
};
