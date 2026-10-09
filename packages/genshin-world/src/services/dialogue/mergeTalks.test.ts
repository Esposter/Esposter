import { TALK } from "#src/services/dialogue/constants.test";
import { mergeTalks } from "#src/services/dialogue/mergeTalks";
import { describe, expect, test } from "vitest";

// The same talk id as the sample, begun at another line, so the two are told apart by their start alone
const OTHER_START_TALK = { ...TALK, startLineId: "4" };

describe(mergeTalks, () => {
  test("holds the earlier source's talk where two sources hold one id", () => {
    expect.hasAssertions();

    expect(mergeTalks([TALK], [OTHER_START_TALK])).toStrictEqual(new Map([[TALK.id, TALK]]));
  });

  test("holds a talk only a later source holds", () => {
    expect.hasAssertions();

    expect(mergeTalks([], [OTHER_START_TALK])).toStrictEqual(new Map([[OTHER_START_TALK.id, OTHER_START_TALK]]));
  });

  test("holds the talks of every source by id", () => {
    expect.hasAssertions();

    const residentTalk = { ...TALK, id: "31141" };

    expect(mergeTalks([TALK], [residentTalk])).toStrictEqual(
      new Map([
        [residentTalk.id, residentTalk],
        [TALK.id, TALK],
      ]),
    );
  });
});
