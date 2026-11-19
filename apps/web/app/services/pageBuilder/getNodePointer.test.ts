import { TEST_NESTED_TEXT_ID, TEST_WEBPAGE } from "#src/services/pageBuilder/constants.test";
import { getNodePointer } from "#src/services/pageBuilder/getNodePointer";
import { webpageKind } from "#src/services/pageBuilder/webpageKind";
import { describe, expect, test } from "vitest";

describe(getNodePointer, () => {
  test("a node is found at its pointer by its id, and an id no node holds is found at none", () => {
    expect.hasAssertions();

    expect(getNodePointer(webpageKind, TEST_WEBPAGE, TEST_NESTED_TEXT_ID)).toBe("/content/0/props/children/0");
    expect(getNodePointer(webpageKind, TEST_WEBPAGE, "-1")).toBeUndefined();
  });
});
