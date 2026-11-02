import { TEXT_CHARACTER_WIDTH } from "#src/services/export/constants";
import { getTextWidth } from "#src/services/export/getTextWidth";
import { describe, expect, test } from "vitest";

describe(getTextWidth, () => {
  test("a full-width character takes double the width of a narrow one", () => {
    expect.hasAssertions();

    expect(getTextWidth("a")).toBe(TEXT_CHARACTER_WIDTH);
    expect(getTextWidth("文")).toBe(TEXT_CHARACTER_WIDTH * 2);
  });
});
