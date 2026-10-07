import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";

import { selectFinestLevels } from "#src/services/genshinAssets/shared/selectFinestLevels";
import { existsSync } from "node:fs";
import { join } from "node:path";

// Every placement drawing the level of detail of a part a render draws (each object's finest exported), a mesh named
// `<part>_Lod<level>` by the pattern's `part` and `level` groups, tagged with its part, and each part's most detailed
// Mesh the export holds: a scene places a part's levels together, and the finest of them is what its shape is fitted
// From. A level drawn with other materials than the part's finest level is painted unlike it (a far tower's coarsest
// Level is the ground's stone alone, which its finest draws only at its foot), so it is a part of its own, named by its
// Mesh and fitted from it
export const readLevelOfDetailParts = (
  placements: readonly AssetPlacement[],
  meshRegex: RegExp,
  meshDirectory: string,
): { meshPathMap: Map<string, string>; partPlacements: (AssetPlacement & { part: string })[] } => {
  const drawn = selectFinestLevels(placements, (mesh) => existsSync(join(meshDirectory, `${mesh}.obj`)));
  const partFinestMap = new Map<string, { level: number; materials: Set<string> }>();
  for (const { materials, mesh } of drawn) {
    const groups = meshRegex.exec(mesh)?.groups;
    if (!groups?.part) continue;
    const level = Number(groups.level);
    const finest = partFinestMap.get(groups.part);
    if (!finest || level < finest.level) partFinestMap.set(groups.part, { level, materials: new Set(materials) });
    else if (level === finest.level) for (const material of materials) finest.materials.add(material);
  }
  const partPlacements = drawn.flatMap((placement) => {
    const part = meshRegex.exec(placement.mesh)?.groups?.part;
    if (!part) return [];
    const finestMaterials = partFinestMap.get(part)?.materials;
    const isPaintedAlike =
      new Set(placement.materials).size === finestMaterials?.size &&
      placement.materials.every((material) => finestMaterials.has(material));
    return [{ ...placement, part: isPaintedAlike ? part : placement.mesh }];
  });
  const partMeshMap = new Map(
    partPlacements.map(({ mesh, part }) => [
      part,
      part === mesh ? mesh : `${part}_Lod${partFinestMap.get(part)?.level ?? 0}`,
    ]),
  );
  return {
    meshPathMap: new Map(
      [...partMeshMap.keys()]
        .toSorted()
        .map((part) => [part, join(meshDirectory, `${partMeshMap.get(part) ?? part}.obj`)]),
    ),
    partPlacements,
  };
};
