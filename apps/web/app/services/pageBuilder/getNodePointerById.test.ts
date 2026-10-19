import { TEST_NESTED_TEXT_ID, TEST_WEBPAGE } from "@/services/pageBuilder/constants.test";
import { getNodePointerById } from "@/services/pageBuilder/getNodePointerById";
import { describe, expect, test } from "vitest";

describe(getNodePointerById, () => {
  test("a node is found by its id at its pointer", () => {
    expect.hasAssertions();

    expect(getNodePointerById(TEST_WEBPAGE, TEST_NESTED_TEXT_ID)).toBe("/content/0/props/children/0");
    expect(getNodePointerById(TEST_WEBPAGE, "unknown")).toBeUndefined();
  });
});
