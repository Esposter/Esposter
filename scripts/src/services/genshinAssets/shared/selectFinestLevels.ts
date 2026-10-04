import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";

const LEVEL_OF_DETAIL_REGEX = /^(?<part>.+)_Lod(?<level>\d+)$/u;
const toGroupKey = (father: string, part: string): string => `${father}|${part}`;
// The placements a render draws: a scene places each level of an object's part together under one LOD group, so of
// Those levels only the finest with a mesh exported is kept, each object on its own: a far tower placed with its coarse
// Levels alone, or one coarse level standing on its own, is drawn at its finest, not dropped for another tower's finer
// One. A mesh with no levels is kept when it was exported
export const selectFinestLevels = (
  placements: readonly AssetPlacement[],
  hasMesh: (mesh: string) => boolean,
): AssetPlacement[] => {
  const groupLevelMap = new Map<string, number>();
  for (const { father, mesh } of placements) {
    const groups = LEVEL_OF_DETAIL_REGEX.exec(mesh)?.groups;
    if (!groups?.part || !hasMesh(mesh)) continue;
    const key = toGroupKey(father, groups.part);
    const level = Number(groups.level);
    groupLevelMap.set(key, Math.min(level, groupLevelMap.get(key) ?? level));
  }
  return placements.filter(({ father, mesh }) => {
    if (!hasMesh(mesh)) return false;
    const groups = LEVEL_OF_DETAIL_REGEX.exec(mesh)?.groups;
    return !groups?.part || groupLevelMap.get(toGroupKey(father, groups.part)) === Number(groups.level);
  });
};
