import type { InterfaceNode } from "#src/models/genshinAssets/shared/InterfaceNode";

// The piece holding a canvas scaler nearest the roots, read breadth first so the shallowest one wins
export const findNearestUiCanvas = (roots: readonly InterfaceNode[]): InterfaceNode | undefined => {
  let level = roots;
  while (level.length > 0) {
    const found = level.find(({ canvas }) => canvas);
    if (found) return found;
    level = level.flatMap(({ children }) => children);
  }
  return undefined;
};
