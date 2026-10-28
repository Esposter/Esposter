import type { ObjMesh } from "#src/models/genshinAssets/fit/ObjMesh";
import type { ReadSurface } from "#src/models/genshinAssets/fit/ReadSurface";
import type { Texture } from "#src/models/genshinAssets/fit/Texture";
import type { Vector } from "#src/models/shared/Vector";

import { averageSurfaceDetails } from "#src/services/genshinAssets/fit/averageSurfaceDetails";
import { computeTextureDetail } from "#src/services/genshinAssets/fit/computeTextureDetail";
import { readFaceSamples } from "#src/services/genshinAssets/fit/readFaceSamples";
import { sumWeights } from "#src/services/genshinAssets/fit/sumWeights";

// A mesh read through its submeshes' textures: its samples, and its detail as the mean of every texture its covered faces
// Drew, each weighted by the area read through it, so a texture no covered face draws counts for nothing. Each texture's
// Detail is drawn at the metres a texel spans on the faces read through it, their world area over the texels their UVs
// Cover: a terrain tile's base map 2 metres on the flat, its 512 texels over the tile's 1,024, more where the ground
// Slopes, and a mesh's texture its own
export const readSurface = (
  mesh: ObjMesh,
  world: Vector[],
  diffuses: (Texture | undefined)[],
  part: string,
  checkKept?: (centroid: Vector) => boolean,
): ReadSurface => {
  const faceSamples = readFaceSamples(mesh, world, diffuses, part, checkKept);
  const diffuseReadMap = new Map<Texture, { area: number; texels: number; weight: number }>();
  for (const { area, diffuse, samples, texels } of faceSamples) {
    const diffuseRead = diffuseReadMap.get(diffuse) ?? { area: 0, texels: 0, weight: 0 };
    diffuseReadMap.set(diffuse, {
      area: diffuseRead.area + area,
      texels: diffuseRead.texels + texels,
      weight: diffuseRead.weight + sumWeights(samples),
    });
  }
  const details = [...diffuseReadMap].flatMap(([diffuse, { area, texels, weight }]) => {
    const detail = weight > 0 && texels > 0 ? computeTextureDetail(diffuse, Math.sqrt(area / texels)) : undefined;
    return detail ? [{ detail, weight }] : [];
  });
  return { detail: averageSurfaceDetails(details), part, samples: faceSamples.flatMap(({ samples }) => samples) };
};
