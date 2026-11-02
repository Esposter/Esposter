import { getIdsKey } from "@/services/message/subscribables/getIdsKey";
import { ID_SEPARATOR } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getIdsKey, () => {
  test("returns same key regardless of item order", () => {
    expect.hasAssertions();

    expect(getIdsKey([{ id: "b" }, { id: "a" }])).toBe(`a${ID_SEPARATOR}b`);
    expect(getIdsKey([{ id: "a" }, { id: "b" }])).toBe(`a${ID_SEPARATOR}b`);
  });

  test("returns empty string for no items", () => {
    expect.hasAssertions();

    expect(getIdsKey([])).toBe("");
  });
});
