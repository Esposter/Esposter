import type { ObjMesh } from "#src/models/genshinAssets/fit/ObjMesh";
import type { SurfaceSample } from "#src/models/genshinAssets/fit/SurfaceSample";
import type { Texture } from "#src/models/genshinAssets/fit/Texture";
import type { Vector } from "#src/models/shared/Vector";

import { computeTriangleArea } from "#src/services/genshinAssets/fit/computeTriangleArea";
import { computeUvTexels } from "#src/services/genshinAssets/fit/computeUvTexels";
import { sampleFaceUvs } from "#src/services/genshinAssets/fit/sampleFaceUvs";
import { sampleSurfaceTexture } from "#src/services/genshinAssets/fit/sampleSurfaceTexture";
import { mapVector } from "#src/services/shared/mapVector";

// A face's submesh, named for its index among its renderer's materials
const SUBMESH_REGEX = /_(?<submesh>\d+)$/u;

// The samples of a mesh's faces where its vertices stand in the world. Each face is read at the points `sampleFaceUvs`
// Spreads over its UV triangle, through the texture its submesh draws with (`diffuses`, by submesh index), each point
// Weighted by an equal share of the face's world area and how far its texel is covered, and tagged with the `part` it
// Is read for, each face's samples kept with the texture they were read through, the face's world area and the texels
// Its UVs cover. A face whose centroid `checkKept` refuses counts for nothing
export const readFaceSamples = (
  { faceGroups, faces, faceUvs, uvs }: ObjMesh,
  world: Vector[],
  diffuses: (Texture | undefined)[],
  part: string,
  checkKept: (centroid: Vector) => boolean = () => true,
): { area: number; diffuse: Texture; samples: SurfaceSample[]; texels: number }[] => {
  // The UV pair a corner names, or the origin where the corner names none
  const uvAt = (index: number): [number, number] => uvs[index] ?? [0, 0];
  return faces.flatMap(([firstIndex, secondIndex, thirdIndex], face) => {
    const [first, second, third] = [world[firstIndex], world[secondIndex], world[thirdIndex]];
    const submesh = Number(SUBMESH_REGEX.exec(faceGroups[face] ?? "")?.groups?.submesh ?? 0);
    const diffuse = diffuses[submesh];
    if (!first || !second || !third || !diffuse) return [];
    const centroid = mapVector((axis) => (first[axis] + second[axis] + third[axis]) / 3);
    if (!checkKept(centroid)) return [];
    const [firstUvIndex, secondUvIndex, thirdUvIndex] = faceUvs[face] ?? [0, 0, 0];
    const uvTriangle = [uvAt(firstUvIndex), uvAt(secondUvIndex), uvAt(thirdUvIndex)] as const;
    const points = sampleFaceUvs(uvTriangle, diffuse.info);
    const area = computeTriangleArea(first, second, third);
    const samples = points.map((uv) => {
      const { colour, coverage } = sampleSurfaceTexture(diffuse, uv);
      return { colour, part, weight: (area / points.length) * coverage };
    });
    return [{ area, diffuse, samples, texels: computeUvTexels(uvTriangle, diffuse.info) }];
  });
};
