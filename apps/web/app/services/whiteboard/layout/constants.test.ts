// @vitest-environment nuxt
import { WHITEBOARD_LAYOUT, WHITEBOARD_SELECTION_KINDS } from "@/services/whiteboard/layout/constants";
import { WhiteboardContentComponentMap } from "@/services/whiteboard/layout/WhiteboardContentComponentMap";
import { describe, expect, test } from "vitest";
import { checkLayout } from "vue-editor-layout-headless";

describe("whiteboardLayout", () => {
  test("the whiteboard's layout passes the layout check", () => {
    expect.hasAssertions();

    expect(
      checkLayout(WHITEBOARD_LAYOUT, WHITEBOARD_SELECTION_KINDS, Object.keys(WhiteboardContentComponentMap)),
    ).toStrictEqual([]);
  });
});
