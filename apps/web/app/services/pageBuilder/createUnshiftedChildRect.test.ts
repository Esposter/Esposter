import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

import { createUnshiftedChildRect } from "@/services/pageBuilder/createUnshiftedChildRect";
import { describe, expect, test } from "vitest";

describe(createUnshiftedChildRect, () => {
  // The slot holds first and second, and the preview is drawn between them, so the second sits below it
  const boxes: Record<string, OverlayBox> = {
    first: { height: 20, left: 0, top: 0, width: 100 },
    preview: { height: 30, left: 0, top: 20, width: 100 },
    second: { height: 20, left: 0, top: 60, width: 100 },
  };
  const getChildRect = (childId: string) => boxes[childId];

  test("a child after the preview is read where it stood before the preview shifted it", () => {
    expect.hasAssertions();

    const getUnshiftedChildRect = createUnshiftedChildRect({
      getChildRect,
      isHorizontal: false,
      previewId: "preview",
      trailingChildIds: ["second"],
    });

    expect(getUnshiftedChildRect("second")).toStrictEqual({ height: 20, left: 0, top: 20, width: 100 });
  });

  test("a child before the preview is read as it is", () => {
    expect.hasAssertions();

    const getUnshiftedChildRect = createUnshiftedChildRect({
      getChildRect,
      isHorizontal: false,
      previewId: "preview",
      trailingChildIds: ["second"],
    });

    expect(getUnshiftedChildRect("first")).toStrictEqual(boxes.first);
  });

  test("a row's children shift along its width", () => {
    expect.hasAssertions();

    const rowBoxes: Record<string, OverlayBox> = {
      preview: { height: 20, left: 0, top: 0, width: 40 },
      second: { height: 20, left: 50, top: 0, width: 40 },
    };
    const getUnshiftedChildRect = createUnshiftedChildRect({
      getChildRect: (childId) => rowBoxes[childId],
      isHorizontal: true,
      previewId: "preview",
      trailingChildIds: ["second"],
    });

    expect(getUnshiftedChildRect("second")).toStrictEqual({ height: 20, left: 0, top: 0, width: 40 });
  });

  test("no preview drawn leaves every child as it is", () => {
    expect.hasAssertions();

    const getUnshiftedChildRect = createUnshiftedChildRect({
      getChildRect: (childId) => (childId === "preview" ? undefined : boxes[childId]),
      isHorizontal: false,
      previewId: "preview",
      trailingChildIds: ["second"],
    });

    expect(getUnshiftedChildRect("second")).toStrictEqual(boxes.second);
  });
});
