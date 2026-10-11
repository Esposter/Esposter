import type { SceneExport } from "#src/models/scene/SceneExport";
import type { WitnessMaterialFactory } from "#src/models/scene/WitnessMaterialFactory";

import { loadWitness } from "#src/services/scene/loadWitness";
import { Box3 } from "three";

// A component's exports loaded as the witness lays them out, each family's extent read before the parts are placed in
// The world, while their group still stands at its origin and the world's own coordinates are its own
export const loadSceneExport = async (
  layoutUrl: string,
  createMaterial: WitnessMaterialFactory,
  familyMeshRegexMap: Readonly<Record<string, RegExp>>,
): Promise<SceneExport> => {
  const loadedWitness = await loadWitness(layoutUrl, createMaterial, familyMeshRegexMap);
  return {
    ...loadedWitness,
    familyBoundsMap: new Map(
      loadedWitness.parts.children.map((familyGroup) => [familyGroup.name, new Box3().setFromObject(familyGroup)]),
    ),
  };
};
