/* oxlint-disable vitest/prefer-import-in-mock -- A partial fake: the typed module would load Phaser and its full store type; A partial fake: the typed tilemap has members this test never reads */
import type { Tilemaps } from "phaser";

import { LayerName } from "#shared/generated/tiled/layers/Home/LayerName";
import { createTilemapMetadata } from "#src/services/dungeons/tilemap/createTilemapMetadata";
import { useWorldSceneStore } from "#src/store/dungeons/world/scene";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

// The dungeons store imports Phaser, which cannot initialise under the test environment
// oxlint-disable-next-line vitest/prefer-import-in-mock -- A partial fake: the typed module would load Phaser and its full store type
vi.mock("#src/store/dungeons/index", () => import("#src/store/dungeons/index.test"));

describe(createTilemapMetadata, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("each tile layer takes the depth of its place in the tilemap, not its place in the layer names", () => {
    expect.hasAssertions();

    // The names are read in alphabetical order, so Building is created before Ground, though Ground comes first in the tilemap
    const depthMap = new Map<string, number>();
    const worldSceneStore = useWorldSceneStore();
    worldSceneStore.tilemap = {
      addTilesetImage: () => undefined,
      createLayer: (layerName: string) => ({
        setDepth: (depth: number) => {
          depthMap.set(layerName, depth);
        },
      }),
      getObjectLayer: () => undefined,
      layers: [{ name: LayerName.Ground }, { name: LayerName.Building }],
    } as unknown as Tilemaps.Tilemap;

    createTilemapMetadata({ [LayerName.Building]: LayerName.Building, [LayerName.Ground]: LayerName.Ground });

    expect(Object.fromEntries(depthMap)).toStrictEqual({ [LayerName.Building]: 1, [LayerName.Ground]: 0 });
  });
});
