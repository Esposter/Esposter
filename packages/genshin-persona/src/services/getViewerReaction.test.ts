import { ViewerMoment } from "#src/models/ViewerMoment";
import { EMPTY_VIEWER_MOTIONS } from "#src/services/constants";
import { getViewerReaction } from "#src/services/getViewerReaction";
import { describe, expect, test } from "vitest";

describe(getViewerReaction, () => {
  const MOTION = "tap:mtn1";

  test("Attention wanted turns the character", () => {
    expect.hasAssertions();

    expect(
      getViewerReaction(ViewerMoment.Attention, { ...EMPTY_VIEWER_MOTIONS, [ViewerMoment.Attention]: MOTION }),
    ).toStrictEqual({ isExpressionCleared: false, motion: MOTION });
  });

  test("An expression is cleared when a turn ends", () => {
    expect.hasAssertions();

    expect(getViewerReaction(ViewerMoment.TurnEnd, EMPTY_VIEWER_MOTIONS)).toStrictEqual({
      isExpressionCleared: true,
      motion: "",
    });
  });

  test("An unmapped moment sends no motion to the viewer", () => {
    expect.hasAssertions();

    expect(getViewerReaction(ViewerMoment.Attention, EMPTY_VIEWER_MOTIONS)).toStrictEqual({
      isExpressionCleared: false,
      motion: "",
    });
  });
});
