import { useTitleSceneStore } from "@/store/dungeons/title/scene";
import type { Position } from "grid-engine";
import type { Except } from "type-fest";

export const useTitleCursorPositionIncrement = (): Ref<Except<Position, "x">> => {
  const titleSceneStore = useTitleSceneStore();
  const { isContinueEnabled } = storeToRefs(titleSceneStore);
  return computed(() => (isContinueEnabled.value ? { y: 50 } : { y: 100 }));
};
