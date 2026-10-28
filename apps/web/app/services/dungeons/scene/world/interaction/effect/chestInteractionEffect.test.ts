import type { Types } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { ChestObjectProperty } from "#shared/generated/tiled/propertyTypes/class/ChestObjectProperty";
import { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";
import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import { Save } from "#shared/models/dungeons/data/Save";
import { Chest } from "#shared/models/dungeons/data/world/Chest";
import { getItem } from "#shared/services/dungeons/item/getItem";
import { getPositionId } from "@/services/dungeons/direction/getPositionId";
import { chestInteractionEffect } from "@/services/dungeons/scene/world/interaction/effect/chestInteractionEffect";
import type { getDungeonsSoundEffect } from "@/services/dungeons/sound/getDungeonsSoundEffect";
import { useDungeonsStore } from "@/store/dungeons";
import type { useWorldDialogStore } from "@/store/dungeons/world/dialog";
import { Direction } from "grid-engine";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { showMessages } = vi.hoisted(() => ({ showMessages: vi.fn<() => Promise<void>>(() => Promise.resolve()) }));

// The dungeons store imports Phaser, which cannot initialise under the test environment. Only its save is read here, so
// The fake keeps the real save shape and holds one save for every reader
vi.mock(import("@/store/dungeons"), async () => {
  const { Dungeons } = await import("#shared/models/dungeons/data/Dungeons");
  const { Save: DungeonsSave } = await import("#shared/models/dungeons/data/Save");
  const { reactive } = await import("vue");
  const dungeonsStore = reactive({ dungeons: new Dungeons(), save: new DungeonsSave() });
  return { useDungeonsStore: () => dungeonsStore as unknown as ReturnType<typeof useDungeonsStore> };
});

// The dialog is UI over the scene, so only the messages it is asked to show are recorded
vi.mock(import("@/store/dungeons/world/dialog"), () => ({
  useWorldDialogStore: () => ({ showMessages }) as unknown as ReturnType<typeof useWorldDialogStore>,
}));

// Sound plays through Phaser's scene, which is not run here
vi.mock(import("@/services/dungeons/sound/getDungeonsSoundEffect"), () => ({
  getDungeonsSoundEffect: () => ({ play: () => undefined }) as unknown as ReturnType<typeof getDungeonsSoundEffect>,
}));

const getChestObject = (x: number, y: number): Types.Tilemaps.TiledObject & { x: number; y: number } => ({
  id: 0,
  name: "",
  properties: [{ name: ChestObjectProperty.ItemId, type: "string", value: ItemId.Potion }],
  type: "",
  x,
  y,
});

describe(chestInteractionEffect, () => {
  const scene = {} as SceneWithPlugins;
  const chestPosition = { x: 3, y: 4 };

  beforeEach(() => {
    setActivePinia(createPinia());
    const dungeonsStore = useDungeonsStore();
    dungeonsStore.save = new Save();
    dungeonsStore.save.player.position = { x: 3, y: 3 };
    dungeonsStore.save.player.direction = Direction.DOWN;
    dungeonsStore.save.player.inventory = [];
    dungeonsStore.save.world[TilemapKey.Home].chestMap = { [getPositionId(chestPosition)]: new Chest() };
    showMessages.mockClear();
  });

  test("opening a chest adds its item to the inventory and marks it opened", async () => {
    expect.hasAssertions();

    const isHandled = await chestInteractionEffect(scene, [getChestObject(chestPosition.x, chestPosition.y)]);

    const dungeonsStore = useDungeonsStore();
    expect(isHandled).toBe(true);
    expect(dungeonsStore.save.player.inventory).toStrictEqual([{ ...getItem(ItemId.Potion), quantity: 1 }]);
    expect(dungeonsStore.save.world[TilemapKey.Home].chestMap[getPositionId(chestPosition)]?.isOpened).toBe(true);
    expect(showMessages).toHaveBeenCalledWith(scene, [{ text: `You've obtained ${ItemId.Potion}.` }]);
  });

  test("a second item of a kind already held adds to its quantity rather than a new entry", async () => {
    expect.hasAssertions();

    const dungeonsStore = useDungeonsStore();
    dungeonsStore.save.player.inventory = [{ ...getItem(ItemId.Potion), quantity: 1 }];
    await chestInteractionEffect(scene, [getChestObject(chestPosition.x, chestPosition.y)]);

    expect(dungeonsStore.save.player.inventory).toStrictEqual([{ ...getItem(ItemId.Potion), quantity: 2 }]);
  });

  test("an opened chest gives nothing again and says so", async () => {
    expect.hasAssertions();

    const dungeonsStore = useDungeonsStore();
    dungeonsStore.save.world[TilemapKey.Home].chestMap[getPositionId(chestPosition)] = {
      isOpened: true,
      itemId: ItemId.Potion,
    };
    const isHandled = await chestInteractionEffect(scene, [getChestObject(chestPosition.x, chestPosition.y)]);

    expect(isHandled).toBe(true);
    expect(dungeonsStore.save.player.inventory).toStrictEqual([]);
    expect(showMessages).toHaveBeenCalledWith(scene, [{ text: "There is nothing left in the chest." }]);
  });

  test("a chest beside the player is left for the next interaction to claim", async () => {
    expect.hasAssertions();

    const isHandled = await chestInteractionEffect(scene, [getChestObject(2, 4)]);

    expect(isHandled).toBe(false);
    const dungeonsStore = useDungeonsStore();

    expect(dungeonsStore.save.player.inventory).toStrictEqual([]);
    expect(showMessages).not.toHaveBeenCalled();
  });
});
