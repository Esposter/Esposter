import type { Mesh } from "three";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { BufferAttribute, BufferGeometry } from "three";

// A submesh of a rigidly skinned mesh as the OBJ loader leaves it, three corners to each triangle in its faces' order,
// Split into the pieces its bones carry, by bone: each triangle rides the bone its face's first vertex follows, every
// Vertex of a rigid piece following the same one
export const splitRigidPieces = (
  { geometry, name: submeshName }: Pick<Mesh, "geometry" | "name">,
  faceVertices: readonly number[],
  vertexPieces: readonly number[],
): Map<number, BufferGeometry> => {
  const triangleCount = geometry.getAttribute("position").count / 3;
  if (triangleCount !== faceVertices.length)
    throw new InvalidOperationError(
      Operation.Read,
      submeshName,
      `has ${triangleCount} triangles and ${faceVertices.length} faces in its group`,
    );
  const pieceFacesMap = Map.groupBy(faceVertices.entries(), ([face, vertex]) => {
    const piece = vertexPieces[vertex];
    if (piece === undefined)
      throw new InvalidOperationError(Operation.Read, `face ${face}`, `names vertex ${vertex}, which no bone carries`);
    return piece;
  });
  return new Map(
    Array.from(pieceFacesMap, ([piece, faces]) => {
      const pieceGeometry = new BufferGeometry();
      for (const [attributeName, { array, itemSize }] of Object.entries(geometry.attributes)) {
        const triangleLength = 3 * itemSize;
        const pieceArray = new Float32Array(faces.length * triangleLength);
        for (const [index, [face]] of faces.entries())
          pieceArray.set(array.subarray(face * triangleLength, (face + 1) * triangleLength), index * triangleLength);
        pieceGeometry.setAttribute(attributeName, new BufferAttribute(pieceArray, itemSize));
      }
      return [piece, pieceGeometry];
    }),
  );
};
