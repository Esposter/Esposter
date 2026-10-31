import type { Item } from "#shared/models/dungeons/item/Item";

import { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";
import { ItemEffectType } from "#shared/models/dungeons/item/ItemEffectType";
import { consumeItem } from "@/services/dungeons/item/consumeItem";
import { usePlayerStore } from "@/store/dungeons/player";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

// The player store reads the dungeons store, which imports Phaser. Only its inventory is read here, so the fake holds one
// Player for every reader
// oxlint-disable-next-line vitest/prefer-import-in-mock -- A partial fake: the typed module would load Phaser and its full store type
vi.mock("@/store/dungeons/player", async () => {
  const { reactive } = await import("vue");
  const player = reactive({ inventory: [] as Item[] });
  return { usePlayerStore: () => ({ player }) };
});

describe(consumeItem, () => {
  let item: Item;

  beforeEach(() => {
    setActivePinia(createPinia());
    item = {
      description: "description",
      effect: { type: ItemEffectType.Heal, value: 0 },
      id: ItemId.Potion,
      quantity: 1,
    };
    const playerStore = usePlayerStore();
    playerStore.player.inventory = [item];
  });

  test("removes the item once its last one is spent", () => {
    expect.hasAssertions();

    consumeItem(ref(item));

    const playerStore = usePlayerStore();
    expect(playerStore.player.inventory).toStrictEqual([]);
  });

  test("keeps the item while one is left", () => {
    expect.hasAssertions();

    item.quantity = 2;
    consumeItem(ref(item));

    const playerStore = usePlayerStore();
    expect(playerStore.player.inventory).toStrictEqual([{ ...item, quantity: 1 }]);
  });
});
