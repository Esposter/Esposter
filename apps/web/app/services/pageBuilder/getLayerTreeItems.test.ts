import {
  TEST_NESTED_TEXT_ID,
  TEST_ROOT_TEXT_ID,
  TEST_SECTION_ID,
  TEST_WEBPAGE,
} from "@/services/pageBuilder/constants.test";
import { getLayerTreeItems } from "@/services/pageBuilder/getLayerTreeItems";
import { describe, expect, test } from "vitest";

describe(getLayerTreeItems, () => {
  test("nests a row under the nearest row one depth up, each labelled by its type's title", () => {
    expect.hasAssertions();

    expect(getLayerTreeItems(TEST_WEBPAGE)).toStrictEqual([
      { children: [{ children: [], id: TEST_NESTED_TEXT_ID, title: "Text" }], id: TEST_SECTION_ID, title: "Section" },
      { children: [], id: TEST_ROOT_TEXT_ID, title: "Text" },
    ]);
  });
});
