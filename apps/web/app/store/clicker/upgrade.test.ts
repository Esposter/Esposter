// @vitest-environment nuxt
import { UpgradeMap } from "#shared/assets/clicker/data/upgrades/UpgradeMap";
import { CursorUpgradeId } from "#shared/models/clicker/data/upgrade/CursorUpgradeId";
import { useClickerStore } from "@/store/clicker";
import { useUpgradeStore } from "@/store/clicker/upgrade";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

// The store is the purchase's only gate: the buttons that disable on the price are one caller each, and a purchase
// That reached the store past them would spend points the player does not have
describe(useUpgradeStore, () => {
  const upgradeId = CursorUpgradeId["Reinforced Index Finger"];
  const upgrade = { ...UpgradeMap[upgradeId], id: upgradeId };

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("refuses an upgrade the player cannot pay for", () => {
    expect.hasAssertions();

    const clickerStore = useClickerStore();
    const { clicker } = storeToRefs(clickerStore);
    const upgradeStore = useUpgradeStore();
    const { createBoughtUpgrade } = upgradeStore;
    createBoughtUpgrade(upgrade);

    expect(clicker.value.boughtUpgrades).toStrictEqual([]);
    expect(clicker.value.pointCount).toBe(0);
  });

  test("buys an upgrade once", () => {
    expect.hasAssertions();

    const clickerStore = useClickerStore();
    const { clicker } = storeToRefs(clickerStore);
    const upgradeStore = useUpgradeStore();
    const { createBoughtUpgrade } = upgradeStore;
    clicker.value.pointCount = upgrade.price * 2;
    createBoughtUpgrade(upgrade);
    createBoughtUpgrade(upgrade);

    expect(clicker.value.boughtUpgrades).toStrictEqual([upgrade]);
    expect(clicker.value.pointCount).toBe(upgrade.price);
  });
});
