import { TEST_DOCUMENT, TEST_REGISTRY } from "#src/services/constants.test";
import { getAcceptedTypes } from "#src/services/getAcceptedTypes";
import { describe, expect, test } from "vitest";

describe(getAcceptedTypes, () => {
  test("a slot the node's definition does not name", () => {
    expect.hasAssertions();

    expect(getAcceptedTypes(TEST_DOCUMENT, TEST_REGISTRY, "/content/0/props/constructor")).toStrictEqual([]);
  });
});
