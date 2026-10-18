import { TEST_DOCUMENT, TEST_REGISTRY } from "#src/services/constants.test";
import { getAcceptedTypes } from "#src/services/getAcceptedTypes";
import { describe, expect, test } from "vitest";

describe(getAcceptedTypes, () => {
  test.each<[string, string]>([
    ["a slot the node's definition does not name", "/content/0/props/constructor"],
    ["a slot of a node the document does not hold", "/content/5/props/children"],
  ])("%s", (_title, slotPointer) => {
    expect.hasAssertions();

    expect(getAcceptedTypes(TEST_DOCUMENT, TEST_REGISTRY, slotPointer)).toStrictEqual([]);
  });
});
