import type { AssetPlacement } from "#src/models/genshinAssets/AssetPlacement";

const LEVEL_OF_DETAIL_REGEX = /^(?<part>.+)_Lod(?<level>\d+)$/u;
// The placements a render draws: a scene places each level of a part together, so of a part's levels only its finest
// With a mesh exported is kept, and a mesh with no levels is kept when it was exported
export const selectFinestLevels = (
  placements: readonly AssetPlacement[],
  hasMesh: (mesh: string) => boolean,
): AssetPlacement[] => {
  const partLevelMap = new Map<string, number>();
  for (const { mesh } of placements) {
    const groups = LEVEL_OF_DETAIL_REGEX.exec(mesh)?.groups;
    if (!groups?.part || !hasMesh(mesh)) continue;
    const level = Number(groups.level);
    partLevelMap.set(groups.part, Math.min(level, partLevelMap.get(groups.part) ?? level));
  }
  return placements.filter(({ mesh }) => {
    if (!hasMesh(mesh)) return false;
    const groups = LEVEL_OF_DETAIL_REGEX.exec(mesh)?.groups;
    return !groups?.part || partLevelMap.get(groups.part) === Number(groups.level);
  });
};
