import { settleEach } from "#src/services/shared/settleEach";
import { describe, expect, test } from "vitest";

describe(settleEach, () => {
  test("reads each item it can and names each it cannot, leaving the rest read", async () => {
    expect.hasAssertions();

    await expect(
      settleEach(
        ["a", "bad", "c"],
        (item) => item,
        (item) => (item === "bad" ? Promise.reject(new Error("broken")) : Promise.resolve(item.toUpperCase())),
      ),
    ).resolves.toStrictEqual({ failures: ["bad: broken"], results: ["A", "C"] });
  });

  test("reads nothing and names nothing for no items", async () => {
    expect.hasAssertions();

    const noItems: string[] = [];
    await expect(
      settleEach(
        noItems,
        (item) => item,
        (item) => Promise.resolve(item),
      ),
    ).resolves.toStrictEqual({ failures: [], results: [] });
  });
});
