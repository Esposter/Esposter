import type { GroundLayerField } from "#src/models/terrain/GroundLayerField";

import { GroundLayer, GroundLayers } from "#src/models/terrain/GroundLayer";

// Writes each layer's share a field gives at a point into the weights: blended bilinearly from the four nodes round it,
// Kept to the grid's edges and summing to one, or all grass where the field names no layer. The weights are the
// Caller's record, so no point allocates
export const sampleGroundLayerField = (
  { cellSize, layers, origin, size }: GroundLayerField,
  x: number,
  z: number,
  weights: Record<GroundLayer, number>,
): void => {
  const sizeX = size[0] ?? 1;
  const sizeZ = size[1] ?? 1;
  const column = Math.min(Math.max((x - (origin[0] ?? 0)) / cellSize, 0), sizeX - 1);
  const row = Math.min(Math.max((z - (origin[1] ?? 0)) / cellSize, 0), sizeZ - 1);
  const left = Math.floor(column);
  const near = Math.floor(row);
  const right = Math.min(left + 1, sizeX - 1);
  const far = Math.min(near + 1, sizeZ - 1);
  const across = column - left;
  const along = row - near;
  let total = 0;
  for (const layer of GroundLayers) {
    const shares = layers[layer];
    const share =
      shares === undefined
        ? 0
        : ((shares[near * sizeX + left] ?? 0) * (1 - across) + (shares[near * sizeX + right] ?? 0) * across) *
            (1 - along) +
          ((shares[far * sizeX + left] ?? 0) * (1 - across) + (shares[far * sizeX + right] ?? 0) * across) * along;
    weights[layer] = share;
    total += share;
  }
  if (total === 0) {
    weights[GroundLayer.Grass] = 1;
    return;
  }
  for (const layer of GroundLayers) weights[layer] /= total;
};
