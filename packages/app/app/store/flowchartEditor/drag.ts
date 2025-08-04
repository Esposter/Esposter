import { NodeType } from "#shared/models/flowchartEditor/data/NodeType";

export const useDragStore = defineStore("flowchartEditor/drag", () => {
  const isDragging = ref(false);
  const isDragOver = ref(false);
  const type = ref(NodeType.Base);

  watch(isDragging, (dragging) => {
    document.body.style.userSelect = dragging ? "none" : "";
  });

  return { isDragging, isDragOver, type };
});
