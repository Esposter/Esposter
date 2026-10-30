import type { InterfaceNode } from "#src/models/genshinAssets/shared/InterfaceNode";

// A container's RectTransform trees, and the canvas scaler nearest their roots
export interface UiTrees {
  canvas?: InterfaceNode;
  roots: InterfaceNode[];
}
