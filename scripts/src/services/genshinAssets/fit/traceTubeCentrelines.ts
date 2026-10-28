import type { Vector } from "#src/models/shared/Vector";
import type { TreeTube } from "genshin-engine";

import { findOpenLoops } from "#src/services/genshinAssets/fit/findOpenLoops";
import { joinMeshVertices } from "#src/services/genshinAssets/fit/joinMeshVertices";
import { simplifyPath } from "#src/services/genshinAssets/fit/simplifyPath";
import { splitMeshComponents } from "#src/services/genshinAssets/fit/splitMeshComponents";
import { toPaths } from "#src/services/genshinAssets/fit/toPaths";
import { traceSkeleton } from "#src/services/genshinAssets/fit/traceSkeleton";

// A mesh of tubes, such as a tree's surface roots or its trunk and limbs, as the centrelines it is swept along, in the
// Mesh's own frame: each piece it splits into is traced along its own length from its start, cut at every step of that
// Distance into the loops round it, each loop's centroid and mean radius a point, forking where the loops part and
// Closing on its tip with no radius. A piece starts at its widest open loop, where it leaves the trunk or the limb or
// Root it grows from, else at its vertex nearest the axis; the trunk, the piece standing lowest where the mesh has one,
// Starts at its foot, its vertices within a step of its lowest. Every other open loop is a hole in the bark, filled by
// A fan from its centroid so the cuts pass over it as over the bark round it. Each path is simplified within the
// Tolerance, its radius weighed as its place is
export const traceTubeCentrelines = (
  vertices: readonly Vector[],
  faces: readonly Vector[],
  { hasTrunk, levelStep, tolerance }: { hasTrunk: boolean; levelStep: number; tolerance: number },
): TreeTube[] => {
  const joined = joinMeshVertices(vertices);
  const pieces = splitMeshComponents(vertices, faces).map((pieceFaceIndices) =>
    pieceFaceIndices.map((face): Vector => {
      const [first = 0, second = 0, third = 0] = faces[face] ?? [];
      return [joined[first] ?? first, joined[second] ?? second, joined[third] ?? third];
    }),
  );
  const getHeight = (vertex: number): number => vertices[vertex]?.[1] ?? 0;
  const computeLowest = (pieceFaces: readonly Vector[]): number =>
    Math.min(...pieceFaces.flat().map((vertex) => getHeight(vertex)));
  const pieceLowests = pieces.map((pieceFaces) => computeLowest(pieceFaces));
  const trunkPiece = hasTrunk ? pieceLowests.indexOf(Math.min(...pieceLowests)) : -1;
  return pieces.flatMap((pieceFaces, piece) => {
    const loops = findOpenLoops(vertices, pieceFaces);
    const widestLoop = loops.reduce<(typeof loops)[number] | undefined>(
      (widest, loop) => (widest && widest.radius >= loop.radius ? widest : loop),
      undefined,
    );
    const pieceVertices = [...new Set(pieceFaces.flat())];
    let startVertices: number[];
    if (piece === trunkPiece) {
      const lowest = pieceLowests[piece] ?? 0;
      startVertices = pieceVertices.filter((vertex) => getHeight(vertex) <= lowest + levelStep);
    } else if (widestLoop) startVertices = widestLoop.vertices;
    else
      startVertices = [
        pieceVertices.reduce((nearest, vertex) =>
          Math.hypot(vertices[vertex]?.[0] ?? 0, vertices[vertex]?.[2] ?? 0) <
          Math.hypot(vertices[nearest]?.[0] ?? 0, vertices[nearest]?.[2] ?? 0)
            ? vertex
            : nearest,
        ),
      ];
    const holes = loops.filter((loop) => piece === trunkPiece || loop !== widestLoop);
    const filledVertices = holes.length > 0 ? [...vertices, ...holes.map(({ centre }) => centre)] : vertices;
    const filledFaces = [
      ...pieceFaces,
      ...holes.flatMap(({ edges }, hole) =>
        edges.map(([first, second]): Vector => [first, second, vertices.length + hole]),
      ),
    ];
    return toPaths(traceSkeleton(filledVertices, filledFaces, startVertices, levelStep)).flatMap((path): TreeTube[] => {
      const [first, second, ...rest] = simplifyPath(path, tolerance).map(([x, y, z, radius]) => ({ radius, x, y, z }));
      return first && second ? [[first, second, ...rest]] : [];
    });
  });
};
