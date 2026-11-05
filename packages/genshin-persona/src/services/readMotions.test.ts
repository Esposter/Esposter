import { ViewerMoment } from "#src/models/ViewerMoment";
import { EMPTY_VIEWER_MOTIONS } from "#src/services/constants";
import { readMotions } from "#src/services/readMotions";
import { describe, expect, test } from "vitest";

describe(readMotions, () => {
  const MOTION = "tap:mtn1";

  test("a stored motion map with a moment missing reads that moment as unmapped", () => {
    expect.hasAssertions();

    expect(readMotions({ [ViewerMoment.Attention]: MOTION })).toStrictEqual({
      ...EMPTY_VIEWER_MOTIONS,
      [ViewerMoment.Attention]: MOTION,
    });
  });

  test("a stored value that is no motion reads as unmapped", () => {
    expect.hasAssertions();

    expect(readMotions(null)).toStrictEqual(EMPTY_VIEWER_MOTIONS);
    expect(readMotions({ [ViewerMoment.Attention]: 0 })).toStrictEqual(EMPTY_VIEWER_MOTIONS);
  });
});
