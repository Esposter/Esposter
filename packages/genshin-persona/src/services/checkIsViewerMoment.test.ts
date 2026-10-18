import { ViewerMoment } from "#src/models/ViewerMoment";
import { checkIsViewerMoment } from "#src/services/checkIsViewerMoment";
import { describe, expect, test } from "vitest";

describe(checkIsViewerMoment, () => {
  test.each([ViewerMoment.Attention, ViewerMoment.TurnEnd])("accepts %j", (name) => {
    expect.hasAssertions();

    expect(checkIsViewerMoment(name)).toBe(true);
  });

  test.each(["", "attentions", "turn-end"])("rejects %j", (name) => {
    expect.hasAssertions();

    expect(checkIsViewerMoment(name)).toBe(false);
  });
});
