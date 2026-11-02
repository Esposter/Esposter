import type { Inventory } from "#src/models/inventory/Inventory";

import { Currency } from "#src/models/inventory/Currency";
import { EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { useWorldSessionStore } from "#src/store/session";
import { startTestWorldSession } from "#src/store/session.fixture";
import { createPinia, setActivePinia } from "pinia";
import { describe, expect, test, vi } from "vitest";

describe(useWorldSessionStore, () => {
  test("reads the context it started with", () => {
    expect.hasAssertions();

    const worldSessionStore = startTestWorldSession({
      gameDataBaseUrl: "https://example.test/data",
      nameText: { 1: "name" },
    });

    expect(worldSessionStore.gameDataBaseUrl).toBe("https://example.test/data");
    expect(worldSessionStore.nameText).toStrictEqual({ 1: "name" });
  });

  test("refuses a read of the context before the session has started", () => {
    expect.hasAssertions();

    setActivePinia(createPinia());
    const worldSessionStore = useWorldSessionStore();

    expect(() => worldSessionStore.gameDataBaseUrl).toThrowErrorMatchingInlineSnapshot(
      `[NotInitializedError: WorldSessionStore is not initialized]`,
    );
  });

  test("starts from the saved bag and wallet", () => {
    expect.hasAssertions();

    const inventory: Inventory = { ...EMPTY_INVENTORY, nextId: 5 };
    const wallet = { ...EMPTY_WALLET, [Currency.Primogem]: 160 };
    const worldSessionStore = startTestWorldSession({}, { inventory, wallet });

    expect(worldSessionStore.inventory).toStrictEqual(inventory);
    expect(worldSessionStore.wallet).toStrictEqual(wallet);
  });

  test("announces a bag change to the systems that react to it", () => {
    expect.hasAssertions();

    const worldSessionStore = startTestWorldSession();
    const onBagChange = vi.fn<(inventory: Inventory) => void>();
    worldSessionStore.events.on("bagChange", onBagChange);
    const nextInventory: Inventory = { ...EMPTY_INVENTORY, nextId: 2 };

    worldSessionStore.setInventory(nextInventory);

    expect(worldSessionStore.inventory).toStrictEqual(nextInventory);
    expect(onBagChange).toHaveBeenCalledExactlyOnceWith(nextInventory);
  });

  test("stops clean, so a second session starts from nothing", () => {
    expect.hasAssertions();

    const worldSessionStore = startTestWorldSession(
      {},
      { inventory: { ...EMPTY_INVENTORY, nextId: 9 }, wallet: EMPTY_WALLET },
    );
    const onBagChange = vi.fn<(inventory: Inventory) => void>();
    worldSessionStore.events.on("bagChange", onBagChange);

    worldSessionStore.stop();

    expect(worldSessionStore.inventory).toStrictEqual(EMPTY_INVENTORY);
    expect(() => worldSessionStore.language).toThrowErrorMatchingInlineSnapshot(
      `[NotInitializedError: WorldSessionStore is not initialized]`,
    );

    worldSessionStore.events.emit("bagChange", EMPTY_INVENTORY);

    expect(onBagChange).not.toHaveBeenCalled();
  });
});
