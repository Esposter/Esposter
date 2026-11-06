import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import {
  TEST_NESTED_TEXT_ID,
  TEST_ROOT_TEXT_ID,
  TEST_SECTION_ID,
  TEST_WEBPAGE,
} from "@/services/pageBuilder/constants.test";
import { getSlotChildIds } from "@/services/pageBuilder/getSlotChildIds";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { DRAG_PREVIEW_NODE_ID, withDragPreview } from "@/services/pageBuilder/withDragPreview";
import { describe, expect, test } from "vitest";

describe(withDragPreview, () => {
  test("a palette kind is drawn in the slot it would land in", () => {
    expect.hasAssertions();

    const rootPreview = withDragPreview(webpageKind, TEST_WEBPAGE, WebpageNodeType.Text, {
      index: 1,
      slotPointer: "/content",
    });
    const nestedPreview = withDragPreview(webpageKind, TEST_WEBPAGE, WebpageNodeType.Text, {
      index: 0,
      slotPointer: "/content/0/props/children",
    });

    expect(getSlotChildIds(webpageKind, rootPreview, "/content")).toStrictEqual([
      TEST_SECTION_ID,
      DRAG_PREVIEW_NODE_ID,
      TEST_ROOT_TEXT_ID,
    ]);
    expect(getSlotChildIds(webpageKind, nestedPreview, "/content/0/props/children")).toStrictEqual([
      DRAG_PREVIEW_NODE_ID,
      TEST_NESTED_TEXT_ID,
    ]);
  });

  test("a preview changes nothing", () => {
    expect.hasAssertions();

    const before = structuredClone(TEST_WEBPAGE);
    const preview = withDragPreview(webpageKind, TEST_WEBPAGE, WebpageNodeType.Text, {
      index: 1,
      slotPointer: "/content",
    });

    expect(preview).not.toBe(TEST_WEBPAGE);
    expect(TEST_WEBPAGE).toStrictEqual(before);
  });

  test("a slot that refuses the type gives the document back unchanged", () => {
    expect.hasAssertions();

    expect(
      withDragPreview(webpageKind, TEST_WEBPAGE, WebpageNodeType.Column, {
        index: 0,
        slotPointer: "/content/0/props/children",
      }),
    ).toBe(TEST_WEBPAGE);
  });
});
