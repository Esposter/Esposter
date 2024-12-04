import { DEFAULT_NODE_TYPE } from "@/services/flowchartEditor/constants";

export const useDragStore = defineStore("flowchartEditor/drag", () => {
  const isDragging = ref(false);
  const isDragOver = ref(false);
  const type = ref(DEFAULT_NODE_TYPE);

  watch(isDragging, (dragging) => {
    document.body.style.userSelect = dragging ? "none" : "";
  });

  return { isDragging, isDragOver, type };
});
