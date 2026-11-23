/* oxlint-disable vitest/prefer-import-in-mock -- A partial fake: the typed module would load Phaser and its full
   store type; A partial fake: the typed store has members this test never reads; A partial fake: the typed sound has
   members this test never reads */
import type { Types } from "phaser";

import { ChestObjectProperty } from "#shared/generated/tiled/propertyTypes/class/ChestObjectProperty";
import { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";
import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import { Save } from "#shared/models/dungeons/data/Save";
import { Chest } from "#shared/models/dungeons/data/world/Chest";
import { getItem } from "#shared/services/dungeons/item/getItem";
import { getPositionId } from "#src/services/dungeons/direction/getPositionId";
import { chestInteractionEffect } from "#src/services/dungeons/scene/world/interaction/effect/chestInteractionEffect";
import { createSceneWithPlugins } from "#src/services/phaser/createSceneWithPlugins.test";
import { useDungeonsStore } from "#src/store/dungeons/index";
import { Direction } from "grid-engine-headless";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { showMessages } = vi.hoisted(() => ({ showMessages: vi.fn<() => Promise<void>>(() => Promise.resolve()) }));

// The dungeons store imports Phaser, which cannot initialise under the test environment
// A partial fake:
// oxlint-disable-next-line vitest/prefer-import-in-mock -- the typed module would load Phaser and its full store type
vi.mock("#src/store/dungeons/index", () => import("#src/store/dungeons/index.test"));

// The dialog is UI over the scene, so only the messages it is asked to show are recorded
vi.mock("#src/store/dungeons/world/dialog", () => ({ useWorldDialogStore: () => ({ showMessages }) }));

// Sound plays through Phaser's scene, which is not run here
vi.mock("#src/services/dungeons/sound/getDungeonsSoundEffect", () => ({
  getDungeonsSoundEffect: () => ({ play: () => undefined }),
}));

const getChestObject = (x: number, y: number): { x: number; y: number } & Types.Tilemaps.TiledObject => ({
  id: 0,
  name: "",
  properties: [{ name: ChestObjectProperty.ItemId, type: "string", value: ItemId.Potion }],
  type: "",
  x,
  y,
});

describe(chestInteractionEffect, () => {
  const scene = createSceneWithPlugins();
  const chestPosition = { x: 3, y: 4 };

  beforeEach(() => {
    setActivePinia(createPinia());
    const dungeonsStore = useDungeonsStore();
    const { save } = storeToRefs(dungeonsStore);
    save.value = new Save();
    save.value.player.position = { x: 3, y: 3 };
    save.value.player.direction = Direction.Down;
    save.value.player.inventory = [];
    save.value.world[TilemapKey.Home].chestMap = { [getPositionId(chestPosition)]: new Chest() };
    showMessages.mockClear();
  });

  test("opening a chest adds its item to the inventory and marks it opened", async () => {
    expect.hasAssertions();

    const isHandled = await chestInteractionEffect(scene, [getChestObject(chestPosition.x, chestPosition.y)]);

    const dungeonsStore = useDungeonsStore();
    const { save } = storeToRefs(dungeonsStore);
    expect(isHandled).toBe(true);
    expect(save.value.player.inventory).toStrictEqual([{ ...getItem(ItemId.Potion), quantity: 1 }]);
    expect(save.value.world[TilemapKey.Home].chestMap[getPositionId(chestPosition)]?.isOpened).toBe(true);
    expect(showMessages).toHaveBeenCalledWith(scene, [{ text: `You've obtained ${ItemId.Potion}.` }]);
  });

  test("a second item of a kind already held adds to its quantity rather than a new entry", async () => {
    expect.hasAssertions();

    const dungeonsStore = useDungeonsStore();
    const { save } = storeToRefs(dungeonsStore);
    save.value.player.inventory = [{ ...getItem(ItemId.Potion), quantity: 1 }];
    await chestInteractionEffect(scene, [getChestObject(chestPosition.x, chestPosition.y)]);

    expect(save.value.player.inventory).toStrictEqual([{ ...getItem(ItemId.Potion), quantity: 2 }]);
  });

  test("an opened chest gives nothing again and says so", async () => {
    expect.hasAssertions();

    const dungeonsStore = useDungeonsStore();
    const { save } = storeToRefs(dungeonsStore);
    save.value.world[TilemapKey.Home].chestMap[getPositionId(chestPosition)] = {
      isOpened: true,
      itemId: ItemId.Potion,
    };
    const isHandled = await chestInteractionEffect(scene, [getChestObject(chestPosition.x, chestPosition.y)]);

    expect(isHandled).toBe(true);
    expect(save.value.player.inventory).toStrictEqual([]);
    expect(showMessages).toHaveBeenCalledWith(scene, [{ text: "There is nothing left in the chest." }]);
  });

  test("a chest beside the player is left for the next interaction to claim", async () => {
    expect.hasAssertions();

    const isHandled = await chestInteractionEffect(scene, [getChestObject(2, 4)]);

    expect(isHandled).toBe(false);
    const dungeonsStore = useDungeonsStore();
    const { save } = storeToRefs(dungeonsStore);

    expect(save.value.player.inventory).toStrictEqual([]);
    expect(showMessages).not.toHaveBeenCalled();
  });
});
