import { computeTerrainIndices } from "#src/terrain/computeTerrainIndices";
import { computeTerrainTile } from "#src/terrain/computeTerrainTile";
import { TERRAIN_RING_INITIAL_TILE_COUNT } from "#src/terrain/constants";
import { createTerrainRing } from "#src/terrain/createTerrainRing";
import { getTerrainTileKey } from "#src/terrain/getTerrainTileKey";
import { MeshBasicMaterial } from "three";
import { describe, expect, test } from "vitest";

const writeNothing = () => {};

describe(createTerrainRing, () => {
  const CELLS_PER_SIDE = 1;
  const FINEST_TILE_SIZE = 1;
  const tileIndices = computeTerrainIndices(CELLS_PER_SIDE);
  const createTile = (column: number) =>
    computeTerrainTile({
      cellsPerSide: CELLS_PER_SIDE,
      finestTileSize: FINEST_TILE_SIZE,
      getHeight: () => column,
      key: getTerrainTileKey(0, column, 0),
      writeColor: writeNothing,
    });
  const createRing = () =>
    createTerrainRing(
      { cellsPerSide: CELLS_PER_SIDE, finestTileSize: FINEST_TILE_SIZE },
      tileIndices,
      new MeshBasicMaterial(),
    );

  test("draws a tile from the slot its key was written into", () => {
    expect.hasAssertions();

    const ring = createRing();
    const firstTile = createTile(0);
    const secondTile = createTile(1);
    ring.add(firstTile);
    ring.add(secondTile);
    ring.draw([secondTile.key]);
    const { drawRange, index } = ring.mesh.geometry;
    const positions = ring.mesh.geometry.getAttribute("position");
    const firstIndex = index?.getX(0) ?? 0;

    expect(ring.mesh.visible).toBe(true);
    expect(drawRange.count).toBe(tileIndices.length);
    expect(positions.getX(firstIndex)).toBe(1);
    expect(positions.getY(firstIndex)).toBe(1);
  });

  test("gives a removed tile's slot to the next tile and hides when it draws none held", () => {
    expect.hasAssertions();

    const ring = createRing();
    const firstTile = createTile(0);
    ring.add(firstTile);
    ring.remove(firstTile.key);
    ring.add(createTile(2));
    const positions = ring.mesh.geometry.getAttribute("position");
    ring.draw([firstTile.key]);

    expect(positions.getX(0)).toBe(2);
    expect(ring.mesh.visible).toBe(false);
  });

  test("keeps what it holds as it grows past its slots, and bounds only the tiles held", () => {
    expect.hasAssertions();

    const ring = createRing();
    const tiles = Array.from({ length: TERRAIN_RING_INITIAL_TILE_COUNT + 1 }, (_value, column) => createTile(column));
    for (const tile of tiles) ring.add(tile);
    ring.remove(tiles.at(-1)?.key ?? 0);
    ring.draw([tiles[0]?.key ?? 0]);
    const { boundingBox, drawRange, index } = ring.mesh.geometry;
    const positions = ring.mesh.geometry.getAttribute("position");
    const firstIndex = index?.getX(0) ?? 0;

    expect(index?.count).toBe(TERRAIN_RING_INITIAL_TILE_COUNT * 2 * tileIndices.length);
    expect(drawRange.count).toBe(tileIndices.length);
    expect(positions.getX(firstIndex)).toBe(0);
    expect(boundingBox?.max.x).toBe(TERRAIN_RING_INITIAL_TILE_COUNT);
  });
});
