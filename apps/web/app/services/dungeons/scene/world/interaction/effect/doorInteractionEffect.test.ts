/* oxlint-disable vitest/prefer-import-in-mock -- A partial fake: the typed module would load Phaser and its full store type; A partial fake: the typed store has members this test never reads; A partial fake: the typed sound has members this test never reads */
import type { TeleportTarget } from "#shared/generated/tiled/propertyTypes/class/TeleportTarget";
import type { Types } from "phaser";

import { TeleportObjectProperty } from "#shared/generated/tiled/propertyTypes/class/TeleportObjectProperty";
import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import { Save } from "#shared/models/dungeons/data/Save";
import homeBuilding1 from "#src/assets/dungeons/scene/world/Home/HomeBuilding1/tilemap.json";
import homeBuilding2 from "#src/assets/dungeons/scene/world/Home/HomeBuilding2/tilemap.json";
import home from "#src/assets/dungeons/scene/world/Home/tilemap.json";
import { CharacterId } from "#src/models/dungeons/scene/world/CharacterId";
import { doorInteractionEffect } from "#src/services/dungeons/scene/world/interaction/effect/doorInteractionEffect";
import { createSceneWithPlugins } from "#src/services/phaser/createSceneWithPlugins.test";
import { useDungeonsStore } from "#src/store/dungeons/index";
import { takeOne } from "@esposter/shared";
import { createGridEngine, Direction } from "grid-engine-headless";
import { ok } from "neverthrow";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

// The dungeons store imports Phaser, which cannot initialise under the test environment
// oxlint-disable-next-line vitest/prefer-import-in-mock -- A partial fake: the typed module would load Phaser and its full store type
vi.mock("#src/store/dungeons/index", () => import("#src/store/dungeons/index.test"));

// Sound plays through Phaser's scene, which is not run here
vi.mock("#src/services/dungeons/sound/getDungeonsSoundEffect", () => ({
  getDungeonsSoundEffect: () => ({ play: () => undefined }),
}));

// The fade is Phaser's, and the test calls the listener that runs once it completes
vi.mock("phaser", () => ({ Cameras: { Scene2D: { Events: {} } } }));
vi.mock("vue-phaserjs", () => ({ useCameraStore: () => ({ fadeIn: () => undefined, fadeOut: () => undefined }) }));

const getDoorObject = (
  x: number,
  y: number,
  teleportTarget: TeleportTarget,
): { x: number; y: number } & Types.Tilemaps.TiledObject => ({
  id: 0,
  name: "",
  properties: [{ name: TeleportObjectProperty.Target, type: "class", value: teleportTarget }],
  type: "",
  x,
  y,
});

describe(doorInteractionEffect, () => {
  const once = vi.fn<(event: unknown, listener: () => Promise<void>) => void>();
  // Each map's Tiled JSON is read by its own key, so a door reads the map it names and no other
  const tilemaps = {
    [TilemapKey.Home]: home,
    [TilemapKey.HomeBuilding1]: homeBuilding1,
    [TilemapKey.HomeBuilding2]: homeBuilding2,
  };
  const scene = Object.assign(createSceneWithPlugins(), {
    cache: { tilemap: { get: (key: TilemapKey) => ({ data: tilemaps[key] }) } },
    cameras: { main: { once } },
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    const dungeonsStore = useDungeonsStore();
    const { save } = storeToRefs(dungeonsStore);
    save.value = new Save();
    once.mockClear();
  });

  test("a door into a smaller tilemap leaves the player on that tilemap's grid, where the character joins and moves", async () => {
    expect.hasAssertions();

    const dungeonsStore = useDungeonsStore();
    const { save } = storeToRefs(dungeonsStore);
    // The player stands below a door of Home, outside the smaller tilemap's grid, and walks up into the door
    save.value.player.position = { x: 6, y: 21 };
    save.value.player.direction = Direction.Up;
    const isHandled = doorInteractionEffect(scene, [
      getDoorObject(6, 20, { id: "1", tilemapKey: TilemapKey.HomeBuilding1 }),
    ]);
    const [, onFadeOutComplete] = takeOne(once.mock.calls, 0);
    await onFadeOutComplete();

    expect(isHandled).toBe(true);
    expect(save.value.tilemapKey).toBe(TilemapKey.HomeBuilding1);
    expect(save.value.player.position).toStrictEqual({ x: 5, y: 7 });

    // The remounted character joins the target tilemap's engine at that position, and can step from it
    const { height, width } = homeBuilding1;
    const tiles = Array.from({ length: height }, () => Array.from({ length: width }, () => false));
    const playerPositionAfterStep = createGridEngine({ tiles }).andThen((gridEngine) =>
      gridEngine
        .addCharacter({ id: CharacterId.Player, startPosition: save.value.player.position })
        .andThen(() => gridEngine.move(CharacterId.Player, Direction.Left))
        .andThen(() => {
          gridEngine.update(Temporal.Duration.from({ seconds: 1 }).total("milliseconds"));
          return gridEngine.readCharacter(CharacterId.Player);
        })
        .map(({ position }) => position),
    );
    expect(playerPositionAfterStep).toStrictEqual(ok({ x: 4, y: 7 }));
  });
});
