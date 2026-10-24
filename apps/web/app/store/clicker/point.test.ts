// @vitest-environment nuxt
import { useClickerStore } from "@/store/clicker";
import { usePointStore } from "@/store/clicker/point";
import { describe, expect, test } from "vitest";

describe(usePointStore, () => {
  // A price is paid when the points meet it, so the one reading the rows and the buttons share has no off-by-one at
  // Its edge
  test("can pay a price it exactly meets, and not one point more", () => {
    expect.hasAssertions();

    const clickerStore = useClickerStore();
    const { clicker } = storeToRefs(clickerStore);
    const { checkIsAffordable } = usePointStore();
    clicker.value.pointCount = 10;

    expect(checkIsAffordable(10)).toBe(true);
    expect(checkIsAffordable(11)).toBe(false);
  });
});
