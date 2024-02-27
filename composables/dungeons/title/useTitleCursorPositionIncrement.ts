import { useTitleSceneStore } from "@/store/dungeons/title/scene";
import type { Except } from "@/util/types/Except";
import type { Position } from "grid-engine";

export const useTitleCursorPositionIncrement = (): Ref<Except<Position, "x">> => {
  const titleSceneStore = useTitleSceneStore();
  const { isContinueEnabled } = storeToRefs(titleSceneStore);
  return computed(() => (isContinueEnabled.value ? { y: 50 } : { y: 100 }));
};
