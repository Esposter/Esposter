import { talkSchema } from "#src/models/dialogue/Talk";
import { TALK } from "#src/services/dialogue/constants.test";
import { describe, expect, test } from "vitest";

describe("talkSchema", () => {
  const NONEXISTENT_ID = "-1";

  test("takes a talk naming only the lines it holds", () => {
    expect.hasAssertions();

    expect(talkSchema.safeParse(TALK).success).toBe(true);
  });

  test("refuses a talk starting at or leading on to a line it does not hold", () => {
    expect.hasAssertions();

    const [firstLine, ...lines] = TALK.lines;

    expect([
      talkSchema.safeParse({ ...TALK, startLineId: NONEXISTENT_ID }).success,
      talkSchema.safeParse({ ...TALK, lines: [{ ...firstLine, nextLineIds: [NONEXISTENT_ID] }, ...lines] }).success,
    ]).toStrictEqual([false, false]);
  });
});
