import type { DumpedInterfaceRect } from "#src/models/genshinAssets/DumpedInterfaceRect";
import type { InterfaceNode } from "#src/models/genshinAssets/InterfaceNode";

// A screen's interface as a tree from its root down: a RectTransform's own path ID is not in its dump, so it is found
// Through its GameObject, whose first component it is, and each piece's children follow its own list of them. A child
// Whose RectTransform the dump lacks is left out. Without the root, the tree is undefined
export const composeInterfaceTree = (
  rects: readonly DumpedInterfaceRect[],
  gameObjectTransformIdMap: ReadonlyMap<string, string>,
  gameObjectComponentsMap: ReadonlyMap<string, string[]>,
  rootName: string,
): InterfaceNode | undefined => {
  const idRectMap = new Map(
    rects.flatMap((rect) => {
      const transformId = gameObjectTransformIdMap.get(rect.gameObjectId);
      return transformId ? [[transformId, rect] as const] : [];
    }),
  );
  const toNode = (
    { childIds, gameObjectId, layout, name, scale }: DumpedInterfaceRect,
    parentPath: string,
  ): InterfaceNode => {
    const path = parentPath ? `${parentPath}/${name}` : name;
    return {
      ...layout,
      children: childIds.flatMap((childId) => {
        const child = idRectMap.get(childId);
        return child ? [toNode(child, path)] : [];
      }),
      components: gameObjectComponentsMap.get(gameObjectId) ?? [],
      name,
      path,
      scale,
    };
  };
  const root = rects.find(({ name }) => name === rootName);
  return root ? toNode(root, "") : undefined;
};
