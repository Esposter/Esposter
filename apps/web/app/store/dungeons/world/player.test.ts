import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import { Save } from "#shared/models/dungeons/data/Save";
import { useDungeonsStore } from "#src/store/dungeons/index";
import { useWorldPlayerStore } from "#src/store/dungeons/world/player";
import { Direction } from "grid-engine-headless";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

// The dungeons store imports Phaser, which cannot initialise under the test environment
/* oxlint-disable-next-line vitest/prefer-import-in-mock -- A partial fake: the typed module would load Phaser and its
   full store type */
vi.mock("#src/store/dungeons/index", () => import("#src/store/dungeons/index.test"));

describe(useWorldPlayerStore, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const dungeonsStore = useDungeonsStore();
    const { save } = storeToRefs(dungeonsStore);
    save.value = new Save();
  });

  test("a respawn into a smaller tilemap places the player at the respawn location on that tilemap", async () => {
    expect.hasAssertions();

    const dungeonsStore = useDungeonsStore();
    const { save } = storeToRefs(dungeonsStore);
    // The player was left outside the respawn tilemap's grid, on Home
    save.value.player.position = { x: 6, y: 21 };
    save.value.player.respawnLocation = {
      direction: Direction.Up,
      position: { x: 5, y: 7 },
      tilemapKey: TilemapKey.HomeBuilding1,
    };
    const worldPlayerStore = useWorldPlayerStore();
    const { respawn } = worldPlayerStore;
    await respawn();

    expect(save.value.tilemapKey).toBe(TilemapKey.HomeBuilding1);
    expect(save.value.player.position).toStrictEqual({ x: 5, y: 7 });
  });
});
