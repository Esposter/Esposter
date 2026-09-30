import type { DumpedTransform } from "#src/models/genshinAssets/DumpedTransform";
import type { SceneObject } from "#src/models/genshinAssets/SceneObject";

// A block's objects from its transforms, every one of which is dumped under a file of its own. A game object is dumped
// Under its name, so of the objects sharing one (each level of detail under its group) only the last survives, and
// With it the one record of which transform is its: a transform whose game object was lost takes its path ID from a
// Child whose own is known, whose father it is. A transform nothing can place under, a leaf whose own game object was
// Lost, keeps a stand-in ID from its game object's, which no child refers to
export const toSceneObjects = (
  transforms: readonly DumpedTransform[],
  gameObjectTransformIdMap: ReadonlyMap<string, string>,
): SceneObject[] => {
  const gameObjectIds = transforms.map(({ m_GameObject }) => m_GameObject.m_PathID);
  const transformIds = gameObjectIds.map((gameObjectId) => gameObjectTransformIdMap.get(gameObjectId) ?? "");
  const knownIds = new Set(transformIds.filter(Boolean));
  const fatherIdMap = new Map(
    transforms.flatMap(({ m_Father }, index) => {
      const transformId = transformIds[index];
      return transformId ? [[transformId, m_Father.m_PathID] as const] : [];
    }),
  );
  // Each pass names the transforms whose child was named the pass before, so a lost chain resolves from its known foot
  let isResolving = true;
  while (isResolving) {
    isResolving = false;
    for (const [index, { m_Children }] of transforms.entries()) {
      if (transformIds[index]) continue;
      const knownChild = m_Children.find(({ m_PathID }) => knownIds.has(m_PathID));
      const transformId = knownChild ? fatherIdMap.get(knownChild.m_PathID) : undefined;
      if (!transformId) continue;
      transformIds[index] = transformId;
      knownIds.add(transformId);
      fatherIdMap.set(transformId, transforms[index]?.m_Father.m_PathID ?? "");
      isResolving = true;
    }
  }
  return transforms.map(
    ({ m_Father, m_GameObject, m_LocalPosition: p, m_LocalRotation: r, m_LocalScale: s }, index) => ({
      name: m_GameObject.Name,
      parentId: m_Father.m_PathID,
      position: [p.X, p.Y, p.Z],
      rotation: [r.X, r.Y, r.Z, r.W],
      scale: [s.X, s.Y, s.Z],
      transformId: transformIds[index] || `gameObject:${gameObjectIds[index]}`,
    }),
  );
};
