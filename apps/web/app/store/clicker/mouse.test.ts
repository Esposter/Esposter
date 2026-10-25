// @vitest-environment nuxt
import { UpgradeMap } from "#shared/assets/clicker/data/upgrades/UpgradeMap";
import { CursorUpgradeId } from "#shared/models/clicker/data/upgrade/CursorUpgradeId";
import { useClickerStore } from "@/store/clicker";
import { useMouseStore } from "@/store/clicker/mouse";
import { describe, expect, test } from "vitest";

describe(useMouseStore, () => {
  const upgradeId = CursorUpgradeId["Reinforced Index Finger"];
  const upgrade = { ...UpgradeMap[upgradeId], id: upgradeId };

  // A click is worth one point until a bought upgrade reaches the mouse, and then it is worth what the upgrade makes it
  test("powers a click by one until a bought upgrade reaches the mouse", () => {
    expect.hasAssertions();

    const clickerStore = useClickerStore();
    const { clicker } = storeToRefs(clickerStore);
    const mouseStore = useMouseStore();

    expect(mouseStore.mousePower).toBe(1);

    clicker.value.boughtUpgrades.push(upgrade);

    expect(mouseStore.mousePower).toBe(2);
  });
});
