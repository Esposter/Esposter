import {
  TEST_NESTED_TEXT_ID,
  TEST_ROOT_TEXT_ID,
  TEST_SECTION_ID,
  TEST_WEBPAGE,
} from "@/services/pageBuilder/constants.test";
import { getSlotChildIds } from "@/services/pageBuilder/getSlotChildIds";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { describe, expect, test } from "vitest";

describe(getSlotChildIds, () => {
  test("the ids of a slot's children come in the slot's order", () => {
    expect.hasAssertions();

    expect(getSlotChildIds(webpageKind, TEST_WEBPAGE, "/content")).toStrictEqual([TEST_SECTION_ID, TEST_ROOT_TEXT_ID]);
    expect(getSlotChildIds(webpageKind, TEST_WEBPAGE, "/content/0/props/children")).toStrictEqual([
      TEST_NESTED_TEXT_ID,
    ]);
  });

  test("a slot the document does not hold has no children", () => {
    expect.hasAssertions();

    expect(getSlotChildIds(webpageKind, TEST_WEBPAGE, "/missing")).toStrictEqual([]);
  });
});
