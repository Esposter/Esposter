import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { ShrineKeySource } from "#src/models/puzzle/ShrineKeySource";
import type { ShrineMarker } from "#src/models/puzzle/ShrineMarker";

import { useWorldShrines } from "#src/composables/useWorldShrines";
import { MaterialType } from "#src/models/inventory/MaterialType";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { EMPTY_INVENTORY } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { SHRINE_REGION_ID } from "#src/services/puzzle/constants";
import { InteractionKind } from "genshin-interface";
import { GameTextKey } from "genshin-text";
import { describe, expect, test, vi } from "vitest";
import { reactive, ref } from "vue";

// Made-up keys, since no record is copied into a test: one of the shrine's region and one of another region
const KEY_ITEM_ID = 900_001;
const OTHER_KEY_ITEM_ID = 900_002;
const OTHER_REGION = "made-up-region";
const NAMES: Readonly<Record<string, string>> = { "1": "Made-up Key" };
const createMaterialData = (id: number): MaterialData => ({
  id,
  materialType: MaterialType.Consume,
  nameTextId: "1",
  rank: 1,
  rarity: 1,
  stackLimit: 99,
});
const MATERIAL_DATA_MAP = new Map([KEY_ITEM_ID, OTHER_KEY_ITEM_ID].map((id) => [id, createMaterialData(id)] as const));
const KEY_SOURCE: ShrineKeySource = {
  id: "key",
  keyItemId: KEY_ITEM_ID,
  keyRegion: SHRINE_REGION_ID,
  questId: 1,
  rewardId: 1,
};
const OTHER_KEY_SOURCE: ShrineKeySource = {
  id: "other-key",
  keyItemId: OTHER_KEY_ITEM_ID,
  keyRegion: OTHER_REGION,
  questId: 2,
  rewardId: 2,
};
const GAME_TEXT: Readonly<Record<string, string>> = { [GameTextKey.ShrineOfDepths]: "Made-up Shrine" };
const GROUND_HEIGHT = 3;
const SHRINE_ID = "shrine";
const SHRINE_POSITION = { x: 1, z: 2 };

const createBag = (...keys: [itemId: number, quantity: number][]): Inventory =>
  keys.reduce<Inventory>(
    (inventory, [itemId, quantity]) =>
      addInventoryItem(inventory, getItemDefinition(itemId, NAMES, MATERIAL_DATA_MAP), quantity).inventory,
    { ...EMPTY_INVENTORY },
  );

const setup = (bag: Inventory, keySources: ShrineKeySource[]) => {
  const inventory = ref<Inventory>(bag);
  const setInventory = vi.fn<(nextInventory: Inventory) => void>((nextInventory) => {
    inventory.value = nextInventory;
  });
  const shrineMarkers = reactive<ShrineMarker[]>([
    { id: SHRINE_ID, position: SHRINE_POSITION, shrine: { isOpen: false, region: SHRINE_REGION_ID } },
  ]);
  const { openShrineById, shrineInteractables } = useWorldShrines({
    gameText: GAME_TEXT,
    getGroundHeight: () => GROUND_HEIGHT,
    inventory,
    setInventory,
    shrineKeySources: keySources,
    shrineMarkers,
  });
  return { inventory, openShrineById, setInventory, shrineInteractables, shrineMarkers };
};

describe(useWorldShrines, () => {
  test("a shut shrine is offered while its region's key is held", () => {
    expect.hasAssertions();

    const { shrineInteractables } = setup(createBag([KEY_ITEM_ID, 1]), [KEY_SOURCE]);

    expect(shrineInteractables.value).toStrictEqual([
      {
        id: SHRINE_ID,
        kind: InteractionKind.Open,
        name: "Made-up Shrine",
        position: { x: SHRINE_POSITION.x, y: GROUND_HEIGHT, z: SHRINE_POSITION.z },
      },
    ]);
  });

  test("a shrine opens with its region's key, which is spent from the bag, and is no longer offered", () => {
    expect.hasAssertions();

    const { inventory, openShrineById, setInventory, shrineInteractables, shrineMarkers } = setup(
      createBag([KEY_ITEM_ID, 2]),
      [KEY_SOURCE],
    );
    openShrineById(SHRINE_ID);

    expect({
      interactables: shrineInteractables.value,
      isOpen: shrineMarkers[0]?.shrine.isOpen,
      items: inventory.value.items.map(({ definition, quantity }) => ({ id: definition.id, quantity })),
      setInventoryCalls: setInventory.mock.calls.length,
    }).toStrictEqual({
      interactables: [],
      isOpen: true,
      items: [{ id: KEY_ITEM_ID, quantity: 1 }],
      setInventoryCalls: 1,
    });
  });

  test("a shut shrine is not offered without its region's key, and another region's key is kept", () => {
    expect.hasAssertions();

    const { inventory, openShrineById, setInventory, shrineInteractables, shrineMarkers } = setup(
      createBag([OTHER_KEY_ITEM_ID, 1]),
      [OTHER_KEY_SOURCE],
    );
    openShrineById(SHRINE_ID);

    expect({
      interactables: shrineInteractables.value,
      isOpen: shrineMarkers[0]?.shrine.isOpen,
      items: inventory.value.items.map(({ definition, quantity }) => ({ id: definition.id, quantity })),
    }).toStrictEqual({ interactables: [], isOpen: false, items: [{ id: OTHER_KEY_ITEM_ID, quantity: 1 }] });
    expect(setInventory).not.toHaveBeenCalled();
  });
});
