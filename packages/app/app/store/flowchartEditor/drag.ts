import { GeneralNodeType } from "#shared/models/flowchartEditor/node/GeneralNodeType";

export const useDragStore = defineStore("flowchartEditor/drag", () => {
  const isDragging = ref(false);
  const isDragOver = ref(false);
  const type = ref(GeneralNodeType.Rectangle);

  watch(isDragging, (newIsDragging) => {
    window.document.body.style.userSelect = newIsDragging ? "none" : "";
  });

  return { isDragging, isDragOver, type };
});
