import { TEST_NESTED_TEXT_ID, TEST_WEBPAGE } from "@/services/pageBuilder/constants.test";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { describe, expect, test } from "vitest";

describe(getNodePointer, () => {
  test("a node is found by its id at its pointer", () => {
    expect.hasAssertions();

    expect(getNodePointer(TEST_WEBPAGE, TEST_NESTED_TEXT_ID)).toBe("/content/0/props/children/0");
    expect(getNodePointer(TEST_WEBPAGE, "unknown")).toBeUndefined();
  });
});
