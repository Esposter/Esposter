import type { Object3D } from "three";

// The objects a scene draws by kind, each visible one counted under its type, as the scene's tree holds them now
export const countSceneKinds = (root: Object3D): Record<string, number> => {
  const kindCounts: Record<string, number> = {};
  root.traverseVisible(({ type }) => {
    kindCounts[type] = (kindCounts[type] ?? 0) + 1;
  });
  return kindCounts;
};
