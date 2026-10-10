import type { LeafCards } from "#src/models/kits/tree/LeafCards";
import type { TreeCluster } from "#src/models/kits/tree/TreeCluster";
import type { TreeOptions } from "#src/models/kits/tree/TreeOptions";

import { sampleTreeNormalField } from "#src/kits/tree/sampleTreeNormalField";
import { LEAF_SHAPE_KEPT_SHARE } from "#src/nodes/constants";
import { createSeededRandom } from "#src/random/createSeededRandom";

const VERTICES_PER_CARD = 4;
const INDICES_PER_CARD = 6;
const CORNER_SIGNS = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
] as const;
// Leaf cards scattered through a sphere around each cluster's centre, each facing a random way, as many as keep the
// Cluster's leaf area times the tree's scale between them. Every vertex takes its normal from the tree's normal field,
// Or points out from its cluster's centre where none is given, never off its card, so the toon ramp shades the crown as
// Soft masses with a clean terminator, which is how the game's crowns read
export const computeLeafCards = (
  clusters: readonly TreeCluster[],
  {
    cardSize,
    leafAreaScale,
    normalField,
    seed,
  }: Pick<TreeOptions, "cardSize" | "leafAreaScale" | "normalField" | "seed">,
): LeafCards => {
  const random = createSeededRandom(seed + 1);
  const cardKeptArea = (2 * cardSize) ** 2 * LEAF_SHAPE_KEPT_SHARE;
  const clusterCardCounts = clusters.map(({ leafArea }) => Math.round((leafArea * leafAreaScale) / cardKeptArea));
  const cardCount = clusterCardCounts.reduce((sum, clusterCardCount) => sum + clusterCardCount, 0);
  const positions = new Float32Array(cardCount * VERTICES_PER_CARD * 3);
  const normals = new Float32Array(cardCount * VERTICES_PER_CARD * 3);
  const uvs = new Float32Array(cardCount * VERTICES_PER_CARD * 2);
  const indices = new Uint32Array(cardCount * INDICES_PER_CARD);
  let card = 0;
  for (const [cluster, { radius, x: centerX, y: centerY, z: centerZ }] of clusters.entries())
    for (let cardIndex = 0; cardIndex < (clusterCardCounts[cluster] ?? 0); cardIndex++, card++) {
      // A point in the unit ball by rejection, flattened a little so a cluster is wider than it is tall
      let offsetX: number;
      let offsetY: number;
      let offsetZ: number;
      do {
        offsetX = random() * 2 - 1;
        offsetY = random() * 2 - 1;
        offsetZ = random() * 2 - 1;
      } while (offsetX * offsetX + offsetY * offsetY + offsetZ * offsetZ > 1);
      const cardX = centerX + offsetX * radius;
      const cardY = centerY + offsetY * radius * 0.7;
      const cardZ = centerZ + offsetZ * radius;
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
        // Where the field gives none, the cluster's radial normal stands in
        const fieldNormal = normalField ? sampleTreeNormalField(normalField, [x, y, z]) : undefined;
        const [normalX, normalY, normalZ] = fieldNormal ?? [x - centerX, y - centerY, z - centerZ];
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
