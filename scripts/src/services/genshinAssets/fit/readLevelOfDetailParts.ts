import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";

import { selectFinestLevels } from "#src/services/genshinAssets/shared/selectFinestLevels";
import { existsSync } from "node:fs";
import { join } from "node:path";

const toPaintKey = (part: string, materials: readonly string[]): string =>
  `${part}|${[...new Set(materials)].toSorted().join(",")}`;
// Every placement drawing the level of detail of a part a render draws (each object's finest exported), a mesh named
// `<part>_Lod<level>` by the pattern's `part` and `level` groups, tagged with its part, and each part's most detailed
// Mesh the export holds: a scene places a part's levels together, and the finest of them is what its shape is fitted
// From. Each set of materials a part is drawn with is a part of its own, since one painted otherwise fits a facade of
// Its own: the first its finest level is drawn with keeps the part's name, and any other is named by its mesh. A
// Coarser level drawn with the materials of a finest one is fitted from the finest mesh, and one drawn with others (a
// Far tower's coarsest level is the ground's stone alone, which its finest draws only at its foot) from its own
export const readLevelOfDetailParts = (
  placements: readonly AssetPlacement[],
  meshRegex: RegExp,
  meshDirectory: string,
): { meshPathMap: Map<string, string>; partPlacements: (AssetPlacement & { part: string })[] } => {
  const drawn = selectFinestLevels(placements, (mesh) => existsSync(join(meshDirectory, `${mesh}.obj`)));
  const levelPlacements = drawn.flatMap((placement) => {
    const groups = meshRegex.exec(placement.mesh)?.groups;
    return groups?.part ? [{ level: Number(groups.level), part: groups.part, placement }] : [];
  });
  const partFinestLevelMap = new Map<string, number>();
  for (const { level, part } of levelPlacements)
    partFinestLevelMap.set(part, Math.min(level, partFinestLevelMap.get(part) ?? level));
  // Each part's sets of materials by the part each is named and the mesh it is fitted from, the finest levels' first
  const paintPartMap = new Map<string, { mesh: string; part: string }>();
  const parts = new Set<string>();
  for (const { level, part, placement } of levelPlacements.toSorted(
    (first, second) =>
      Number(first.level !== partFinestLevelMap.get(first.part)) -
      Number(second.level !== partFinestLevelMap.get(second.part)),
  )) {
    const paintKey = toPaintKey(part, placement.materials);
    if (paintPartMap.has(paintKey)) continue;
    let name = parts.has(part) ? placement.mesh : part;
    for (let index = 1; parts.has(name); index++) name = `${placement.mesh}_${index}`;
    parts.add(name);
    paintPartMap.set(paintKey, { mesh: placement.mesh, part: name });
  }
  const partPlacements = levelPlacements.map(({ part, placement }) => ({
    ...placement,
    part: paintPartMap.get(toPaintKey(part, placement.materials))?.part ?? part,
  }));
  const partMeshMap = new Map([...paintPartMap.values()].map(({ mesh, part }) => [part, mesh]));
  return {
    meshPathMap: new Map(
      [...partMeshMap.keys()]
        .toSorted()
        .map((part) => [part, join(meshDirectory, `${partMeshMap.get(part) ?? part}.obj`)]),
    ),
    partPlacements,
  };
};
