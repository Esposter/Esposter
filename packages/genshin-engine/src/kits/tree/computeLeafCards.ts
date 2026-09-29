import type { LeafCards } from "#src/kits/tree/LeafCards";
import type { TreeOptions } from "#src/kits/tree/TreeOptions";
import type { Vector3 } from "three";

import { createSeededRandom } from "#src/random/createSeededRandom";

const VERTICES_PER_CARD = 4;
const INDICES_PER_CARD = 6;
const CORNER_SIGNS = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
] as const;
// Leaf cards scattered through a sphere around each cluster centre, each facing a random way. Every vertex's normal
// Points out from its cluster's centre rather than off its card, so the toon ramp shades each cluster as one soft
// Mass with a clean terminator, which is how the game's crowns read
export const computeLeafCards = (
  clusterCenters: readonly Vector3[],
  {
    cardSize,
    cardsPerCluster,
    clusterRadius,
    seed,
  }: Pick<TreeOptions, "cardSize" | "cardsPerCluster" | "clusterRadius" | "seed">,
): LeafCards => {
  const random = createSeededRandom(seed + 1);
  const cardCount = clusterCenters.length * cardsPerCluster;
  const positions = new Float32Array(cardCount * VERTICES_PER_CARD * 3);
  const normals = new Float32Array(cardCount * VERTICES_PER_CARD * 3);
  const uvs = new Float32Array(cardCount * VERTICES_PER_CARD * 2);
  const indices = new Uint32Array(cardCount * INDICES_PER_CARD);
  let card = 0;
  for (const { x: centerX, y: centerY, z: centerZ } of clusterCenters)
    for (let cardIndex = 0; cardIndex < cardsPerCluster; cardIndex++, card++) {
      // A point in the unit ball by rejection, flattened a little so a cluster is wider than it is tall
      let offsetX: number;
      let offsetY: number;
      let offsetZ: number;
      do {
        offsetX = random() * 2 - 1;
        offsetY = random() * 2 - 1;
        offsetZ = random() * 2 - 1;
      } while (offsetX * offsetX + offsetY * offsetY + offsetZ * offsetZ > 1);
      const cardX = centerX + offsetX * clusterRadius;
      const cardY = centerY + offsetY * clusterRadius * 0.7;
      const cardZ = centerZ + offsetZ * clusterRadius;
      // The card's plane from a random facing: a tangent across it and a bitangent up it
      const facingAngle = random() * Math.PI * 2;
      const tiltAngle = (random() - 0.5) * Math.PI;
      const tangentX = Math.cos(facingAngle);
      const tangentZ = Math.sin(facingAngle);
      const bitangentX = -Math.sin(tiltAngle) * tangentZ;
      const bitangentY = Math.cos(tiltAngle);
      const bitangentZ = Math.sin(tiltAngle) * tangentX;
      const vertexStart = card * VERTICES_PER_CARD;
      for (const [cornerIndex, [tangentSign, bitangentSign]] of CORNER_SIGNS.entries()) {
        const vertex = vertexStart + cornerIndex;
        const x = cardX + (tangentX * tangentSign + bitangentX * bitangentSign) * cardSize;
        const y = cardY + bitangentY * bitangentSign * cardSize;
        const z = cardZ + (tangentZ * tangentSign + bitangentZ * bitangentSign) * cardSize;
        const normalX = x - centerX;
        const normalY = y - centerY;
        const normalZ = z - centerZ;
        const length = Math.hypot(normalX, normalY, normalZ) || 1;
        positions[vertex * 3] = x;
        positions[vertex * 3 + 1] = y;
        positions[vertex * 3 + 2] = z;
        normals[vertex * 3] = normalX / length;
        normals[vertex * 3 + 1] = normalY / length;
        normals[vertex * 3 + 2] = normalZ / length;
        uvs[vertex * 2] = (tangentSign + 1) / 2;
        uvs[vertex * 2 + 1] = (bitangentSign + 1) / 2;
      }
      const indexStart = card * INDICES_PER_CARD;
      indices[indexStart] = vertexStart;
      indices[indexStart + 1] = vertexStart + 1;
      indices[indexStart + 2] = vertexStart + 2;
      indices[indexStart + 3] = vertexStart;
      indices[indexStart + 4] = vertexStart + 2;
      indices[indexStart + 5] = vertexStart + 3;
    }
  return { indices, normals, positions, uvs };
};
