import type { TextElement } from "vue-block-editor-headless";

import { WHITEBOARD_PROCESS } from "@/services/whiteboard/constants.test";
import { getDraftPlacement } from "@/services/whiteboard/text/getDraftPlacement";
import { assert, describe, expect, test } from "vitest";
import {
  getTextLayout,
  getTextPlacement,
  getTextWidth,
  PositionedElementType,
  TextSize,
} from "vue-block-editor-headless";

describe(getDraftPlacement, () => {
  test("the element shows the draft as the owner types", () => {
    expect.hasAssertions();

    // An unwrapped text box is as wide as the draft's widest line while it is typed, so the draft breaks where the commit will
    const draft = "Review the order\nnow";
    const textBox: TextElement = {
      color: "",
      id: crypto.randomUUID(),
      isWrapped: false,
      text: "Review",
      textSize: TextSize.Small,
      type: PositionedElementType.Text,
      width: getTextWidth("Review", TextSize.Small),
      x: 0,
      y: 0,
    };
    const placement = getDraftPlacement(textBox, draft);
    assert.exists(placement);

    expect(placement.width).toBe(getTextWidth("Review the order", TextSize.Small));
    expect(getTextLayout(draft, placement).lines.map(({ text }) => text)).toStrictEqual(["Review the order", "now"]);
  });

  test("a wrapped element keeps its own placement while its draft is typed", () => {
    expect.hasAssertions();

    expect(getDraftPlacement(WHITEBOARD_PROCESS, "Review the order")).toStrictEqual(
      getTextPlacement(WHITEBOARD_PROCESS),
    );
  });
});
