import type { DumpedTransform } from "#src/models/genshinAssets/DumpedTransform";
import type { SceneObject } from "#src/models/genshinAssets/SceneObject";

import { ROOT_PARENT_ID } from "#src/services/genshinAssets/constants";

// A group's name past its part's, and a level's
const LOD_GROUP_SUFFIX_REGEX = /_LodGroup(?: \(\d+\))?$/u;
const LOD_LEVEL_SUFFIX_REGEX = /_Lod\d+$/u;
// A block's objects from its transforms, every one of which is dumped under a file of its own. A game object is dumped
// Under its name, so of the objects sharing one (each level of detail under its group) only the last survives, and
// With it the one record of which transform is its: a transform whose game object was lost takes its path ID from a
// Child whose own is known, whose father it is. A transform nothing can place under, a leaf whose own game object was
// Lost, keeps a stand-in ID from its game object's, which no child refers to
export const toSceneObjects = (
  transforms: readonly DumpedTransform[],
  {
    block,
    file,
    gameObjectComponentsMap = new Map(),
    gameObjectTransformIdMap,
  }: {
    block: string;
    file: string;
    gameObjectComponentsMap?: ReadonlyMap<string, string[]>;
    gameObjectTransformIdMap: ReadonlyMap<string, string>;
  },
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
  // A level-of-detail group whose own game object and every level's were lost is named by no child. Its levels still
  // Name their father, and a group is named after them (`<part>_LodGroup (n)` over `<part>_Lod0`…), so each such set
  // Of levels is given to a group of its part holding as many: two groups of one part hold the same levels, so which
  // Takes which places the same parts
  const unresolvedGroups = transforms.flatMap(({ m_Children, m_GameObject }, index) =>
    transformIds[index] || m_Children.length === 0
      ? []
      : [{ childCount: m_Children.length, index, part: m_GameObject.Name.replace(LOD_GROUP_SUFFIX_REGEX, "") }],
  );
  const orphanLevelsMap = Map.groupBy(
    transforms.filter(({ m_Father }) => m_Father.m_PathID !== ROOT_PARENT_ID && !knownIds.has(m_Father.m_PathID)),
    ({ m_Father }) => m_Father.m_PathID,
  );
  const takenGroups = new Set<number>();
  for (const [fatherId, levels] of orphanLevelsMap) {
    const levelPart = levels[0]?.m_GameObject.Name.replace(LOD_LEVEL_SUFFIX_REGEX, "");
    const group = unresolvedGroups.find(
      ({ childCount, index, part }) =>
        !takenGroups.has(index) &&
        part === levelPart &&
        childCount === levels.length &&
        transforms[index]?.m_Father.m_PathID !== fatherId,
    );
    if (!group) continue;
    transformIds[group.index] = fatherId;
    takenGroups.add(group.index);
  }
  return transforms.map(
    ({ m_Children, m_Father, m_GameObject, m_LocalPosition: p, m_LocalRotation: r, m_LocalScale: s }, index) => ({
      block,
      childIds: m_Children.map(({ m_PathID }) => m_PathID),
      components: gameObjectComponentsMap.get(m_GameObject.m_PathID) ?? [],
      file,
      gameObjectId: m_GameObject.m_PathID,
      name: m_GameObject.Name,
      parentFile: file,
      parentId: m_Father.m_PathID,
      position: [p.X, p.Y, p.Z],
      rotation: [r.X, r.Y, r.Z, r.W],
      scale: [s.X, s.Y, s.Z],
      transformId: transformIds[index] || `gameObject:${gameObjectIds[index]}`,
    }),
  );
};
