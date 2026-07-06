import { getIdsKey } from "@/services/message/subscribables/getIdsKey";
import { describe, expect, test } from "vitest";

describe(getIdsKey, () => {
  test("returns same key regardless of item order", () => {
    expect.hasAssertions();

    expect(getIdsKey([{ id: "b" }, { id: "a" }])).toBe("a,b");
    expect(getIdsKey([{ id: "a" }, { id: "b" }])).toBe("a,b");
  });

  test("returns empty string for no items", () => {
    expect.hasAssertions();

    expect(getIdsKey([])).toBe("");
  });
});
