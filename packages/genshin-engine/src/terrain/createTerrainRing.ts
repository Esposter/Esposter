import type { TerrainOptions } from "#src/models/terrain/TerrainOptions";
import type { TerrainRing } from "#src/models/terrain/TerrainRing";
import type { TerrainTileArrays } from "#src/models/terrain/TerrainTileArrays";
import type { Material } from "three";

import { TERRAIN_RING_INITIAL_TILE_COUNT } from "#src/terrain/constants";
import { createTerrainTileGeometry } from "#src/terrain/createTerrainTileGeometry";
import { writeTerrainRingIndices } from "#src/terrain/writeTerrainRingIndices";
import { writeTerrainRingTile } from "#src/terrain/writeTerrainRingTile";
import { Box3, BufferAttribute, Mesh, Sphere } from "three";

const TERRAIN_TILE_ARRAY_KEYS = [
  "coarseColors",
  "coarseNormals",
  "coarsePositions",
  "colors",
  "normals",
  "positions",
] as const satisfies (keyof TerrainTileArrays)[];

const checkSameSlots = (firstSlots: readonly number[], secondSlots: readonly number[]): boolean => {
  if (firstSlots.length !== secondSlots.length) return false;
  for (let index = 0; index < firstSlots.length; index++) if (firstSlots[index] !== secondSlots[index]) return false;
  return true;
};
const createTerrainTileArrays = (vertexCount: number): TerrainTileArrays => ({
  coarseColors: new Float32Array(vertexCount * 3),
  coarseNormals: new Float32Array(vertexCount * 3),
  coarsePositions: new Float32Array(vertexCount * 4),
  colors: new Float32Array(vertexCount * 3),
  normals: new Float32Array(vertexCount * 3),
  positions: new Float32Array(vertexCount * 3),
});
// A far level's ground drawn as one mesh, each tile written into a slot of its own as it arrives and its slot freed as
// It leaves, so a tile costs the copy and the upload of its own arrays and never a rebuild of the level's. The bounds
// Are each held slot's box joined, so no frame computes them over the vertices. When every slot is held the ring
// Doubles, copying what it holds into a new geometry on the same mesh, so a walk grows it rarely
export const createTerrainRing = (
  { cellsPerSide, finestTileSize }: Pick<TerrainOptions, "cellsPerSide" | "finestTileSize">,
  tileIndices: Uint16Array | Uint32Array,
  material: Material,
): TerrainRing => {
  const tileVertexCount = (cellsPerSide + 1) ** 2;
  const slotKeyMap = new Map<number, number>();
  const freeSlots: number[] = [];
  const slotBoxes: Box3[] = [];
  const drawnSlots: number[] = [];
  const writtenSlots: number[] = [];
  const bounds = new Box3();
  const sphere = new Sphere();
  const mesh = new Mesh(undefined, material);
  let arrays = createTerrainTileArrays(0);
  let indices = new Uint32Array();
  let capacity = 0;

  const updateBounds = () => {
    bounds.makeEmpty();
    for (const slot of slotKeyMap.values()) {
      const slotBox = slotBoxes[slot];
      if (slotBox) bounds.union(slotBox);
    }
    mesh.geometry.boundingBox = bounds;
    mesh.geometry.boundingSphere = bounds.getBoundingSphere(sphere);
  };
  const grow = () => {
    const nextCapacity = Math.max(capacity * 2, TERRAIN_RING_INITIAL_TILE_COUNT);
    const nextArrays = createTerrainTileArrays(nextCapacity * tileVertexCount);
    for (const key of TERRAIN_TILE_ARRAY_KEYS) nextArrays[key].set(arrays[key]);
    for (let slot = nextCapacity - 1; slot >= capacity; slot--) freeSlots.push(slot);
    mesh.geometry.dispose();
    indices = new Uint32Array(nextCapacity * tileIndices.length);
    mesh.geometry = createTerrainTileGeometry(nextArrays, new BufferAttribute(indices, 1), bounds);
    arrays = nextArrays;
    capacity = nextCapacity;
    // The new index holds nothing yet, so the next draw writes it whatever it last wrote
    writtenSlots.length = 0;
  };

  grow();
  mesh.visible = false;
  return {
    add: (tile) => {
      if (freeSlots.length === 0) grow();
      const slot = freeSlots.pop() ?? 0;
      const base = slot * tileVertexCount;
      slotKeyMap.set(tile.key, slot);
      writeTerrainRingTile(arrays, base, tile, finestTileSize);
      for (const attribute of Object.values(mesh.geometry.attributes)) {
        if (!(attribute instanceof BufferAttribute)) continue;
        attribute.addUpdateRange(base * attribute.itemSize, tileVertexCount * attribute.itemSize);
        attribute.needsUpdate = true;
      }
      slotBoxes[slot] = (slotBoxes[slot] ?? new Box3()).setFromArray(
        arrays.positions.subarray(base * 3, (base + tileVertexCount) * 3),
      );
      updateBounds();
    },
    dispose: () => {
      mesh.geometry.dispose();
    },
    draw: (keys) => {
      drawnSlots.length = 0;
      for (const key of keys) {
        const slot = slotKeyMap.get(key);
        if (slot !== undefined) drawnSlots.push(slot);
      }
      mesh.visible = drawnSlots.length > 0;
      if (!mesh.visible || checkSameSlots(drawnSlots, writtenSlots)) return;
      const count = writeTerrainRingIndices(indices, tileIndices, drawnSlots, tileVertexCount);
      mesh.geometry.setDrawRange(0, count);
      const { index } = mesh.geometry;
      if (index) {
        index.addUpdateRange(0, count);
        index.needsUpdate = true;
      }
      writtenSlots.length = 0;
      writtenSlots.push(...drawnSlots);
    },
    mesh,
    remove: (key) => {
      const slot = slotKeyMap.get(key);
      if (slot === undefined) return;
      slotKeyMap.delete(key);
      freeSlots.push(slot);
      updateBounds();
    },
  };
};
