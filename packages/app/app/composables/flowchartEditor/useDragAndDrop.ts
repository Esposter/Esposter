import { DEFAULT_NODE_TYPE } from "@/services/flowchartEditor/constants";
import { useDragStore } from "@/store/flowchartEditor/drag";
import { useVueFlow } from "@vue-flow/core";

export const useDragAndDrop = () => {
  const dragStore = useDragStore();
  const { isDragging, isDragOver, type } = storeToRefs(dragStore);
  const { addNodes, onNodesInitialized, screenToFlowCoordinate, updateNode } = useVueFlow();

  const onDragStart = (event: DragEvent, nodeType = DEFAULT_NODE_TYPE) => {
    if (event.dataTransfer) {
      event.dataTransfer.setData("application/vueflow", nodeType);
      event.dataTransfer.effectAllowed = "move";
    }

    type.value = nodeType;
    isDragging.value = true;
    document.addEventListener("drop", onDragEnd);
  };

  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    isDragOver.value = true;

    if (!event.dataTransfer) return;
    event.dataTransfer.dropEffect = "move";
  };

  const onDragLeave = () => {
    isDragOver.value = false;
  };

  const onDragEnd = () => {
    isDragging.value = false;
    isDragOver.value = false;
    type.value = DEFAULT_NODE_TYPE;
    document.removeEventListener("drop", onDragEnd);
  };

  const onDrop = ({ clientX, clientY }: DragEvent) => {
    if (!type.value) return;

    const position = screenToFlowCoordinate({ x: clientX, y: clientY });
    const id = crypto.randomUUID();
    const newNode = { id, position, type: type.value };
    /**
     * Align node position after drop, so it's centered to the mouse
     * We can hook into events even in a callback, and we can remove the event listener after it's been called.
     */
    const { off } = onNodesInitialized(() => {
      updateNode(id, ({ dimensions, position }) => ({
        position: {
          x: position.x - dimensions.width / 2,
          y: position.y - dimensions.height / 2,
        },
      }));
      off();
    });

    addNodes(newNode);
  };

  return {
    onDragLeave,
    onDragOver,
    onDragStart,
    onDrop,
  };
};
