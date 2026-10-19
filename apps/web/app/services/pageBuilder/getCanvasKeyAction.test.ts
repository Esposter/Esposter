import { CanvasKeyAction } from "@/models/pageBuilder/CanvasKeyAction";
import { getCanvasKeyAction } from "@/services/pageBuilder/getCanvasKeyAction";
import { describe, expect, test } from "vitest";

describe(getCanvasKeyAction, () => {
  test("arrow down selects the next node, arrow up the previous, escape the parent", () => {
    expect.hasAssertions();

    expect(getCanvasKeyAction("ArrowDown")).toBe(CanvasKeyAction.Next);
    expect(getCanvasKeyAction("ArrowUp")).toBe(CanvasKeyAction.Previous);
    expect(getCanvasKeyAction("Escape")).toBe(CanvasKeyAction.Parent);
  });

  test("other keys are forwarded", () => {
    expect.hasAssertions();

    expect(getCanvasKeyAction("Enter")).toBeUndefined();
    expect(getCanvasKeyAction("Delete")).toBeUndefined();
    expect(getCanvasKeyAction("ArrowLeft")).toBeUndefined();
  });
});
