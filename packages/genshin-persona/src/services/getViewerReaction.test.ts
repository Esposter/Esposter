import { ViewerMoment } from "#src/models/ViewerMoment";
import { getViewerReaction } from "#src/services/getViewerReaction";
import { describe, expect, test } from "vitest";

describe(getViewerReaction, () => {
  const MOTION = "tap:mtn1";

  test("Attention wanted turns the character", () => {
    expect.hasAssertions();

    expect(getViewerReaction(ViewerMoment.Attention, { [ViewerMoment.Attention]: MOTION })).toStrictEqual({
      isExpressionCleared: false,
      motion: MOTION,
    });
  });

  test("An expression is cleared when a turn ends", () => {
    expect.hasAssertions();

    expect(getViewerReaction(ViewerMoment.TurnEnd, {})).toStrictEqual({ isExpressionCleared: true, motion: undefined });
  });

  test("An unmapped moment sends no motion to the viewer", () => {
    expect.hasAssertions();

    expect(getViewerReaction(ViewerMoment.Attention, {})).toStrictEqual({
      isExpressionCleared: false,
      motion: undefined,
    });
  });
});
