import { useTitleSceneStore } from "@/store/dungeons/title/scene";

export const useTitleCursorPositionIncrement = () => {
  const titleSceneStore = useTitleSceneStore();
  const { isContinueEnabled } = storeToRefs(titleSceneStore);
  return computed(() => ({ y: isContinueEnabled.value ? 50 : 100 }));
};
