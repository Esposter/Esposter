import type { GroundLayerField } from "#src/models/genshinAssets/fit/GroundLayerField";
import type { Except } from "type-fest";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A point's place between the nodes along one axis, kept to the grid: its lower node, its upper node and how far past
// The lower it stands
const toNodeSpan = (value: number, origin: number, cellSize: number, nodeCount: number): [number, number, number] => {
  const coordinate = Math.min(Math.max((value - origin) / cellSize, 0), nodeCount - 1);
  const lower = Math.floor(coordinate);
  return [lower, Math.min(lower + 1, nodeCount - 1), coordinate - lower];
};
// Each layer's share at every node of a grid, from points of the ground each classed to one layer. A point counts toward
// Its four surrounding nodes by how near it stands to each, as a bilinear read gives it back, so a node holds the shares
// Of the ground within a cell of it. A node no point reaches takes the shares of its nearest reached node through the
// Grid (a breadth-first flood), and every share is kept to the decimals a fit keeps
export const computeGroundLayerField = (
  points: readonly { layer: string; x: number; z: number }[],
  { cellSize, origin, size }: Except<GroundLayerField, "layers">,
): GroundLayerField => {
  const [originX, originZ] = origin;
  const [sizeX, sizeZ] = size;
  const layerIndexMap = new Map(
    [...new Set(points.map(({ layer }) => layer))].toSorted().map((layer, index) => [layer, index]),
  );
  const layerCount = layerIndexMap.size;
  if (layerCount === 0) throw new InvalidOperationError(Operation.Read, "ground layer field", "has no points");
  const nodeCount = sizeX * sizeZ;
  const sums = new Float64Array(nodeCount * layerCount);
  const totals = new Float64Array(nodeCount);
  for (const { layer, x, z } of points) {
    const layerIndex = layerIndexMap.get(layer) ?? 0;
    const [left, right, across] = toNodeSpan(x, originX, cellSize, sizeX);
    const [near, far, along] = toNodeSpan(z, originZ, cellSize, sizeZ);
    for (const [column, row, weight] of [
      [left, near, (1 - across) * (1 - along)],
      [right, near, across * (1 - along)],
      [left, far, (1 - across) * along],
      [right, far, across * along],
    ] as const) {
      const node = row * sizeX + column;
      totals[node] = (totals[node] ?? 0) + weight;
      sums[node * layerCount + layerIndex] = (sums[node * layerCount + layerIndex] ?? 0) + weight;
    }
  }
  const shares = new Float64Array(nodeCount * layerCount);
  const visited = new Uint8Array(nodeCount);
  const queue: number[] = [];
  for (const node of totals.keys()) {
    const total = totals[node] ?? 0;
    if (total === 0) continue;
    for (let layerIndex = 0; layerIndex < layerCount; layerIndex++)
      shares[node * layerCount + layerIndex] = (sums[node * layerCount + layerIndex] ?? 0) / total;
    visited[node] = 1;
    queue.push(node);
  }
  // The queue grows as the flood reaches further, which an array iterator follows
  for (const current of queue) {
    const column = current % sizeX;
    const row = Math.floor(current / sizeX);
    for (const [neighbourColumn, neighbourRow] of [
      [column + 1, row],
      [column - 1, row],
      [column, row + 1],
      [column, row - 1],
    ] as const) {
      if (neighbourColumn < 0 || neighbourRow < 0 || neighbourColumn >= sizeX || neighbourRow >= sizeZ) continue;
      const neighbour = neighbourRow * sizeX + neighbourColumn;
      if (visited[neighbour]) continue;
      visited[neighbour] = 1;
      shares.copyWithin(neighbour * layerCount, current * layerCount, (current + 1) * layerCount);
      queue.push(neighbour);
    }
  }
  return {
    cellSize,
    layers: Object.fromEntries(
      [...layerIndexMap].map(([layer, layerIndex]) => [
        layer,
        Array.from({ length: nodeCount }, (_share, node) => roundFitted(shares[node * layerCount + layerIndex] ?? 0)),
      ]),
    ),
    origin,
    size,
  };
};
