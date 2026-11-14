import { MENTION_ID_ATTRIBUTE } from "#src/services/message/constants";
import { createMention } from "#src/services/message/createMention.test";
import { getMentions } from "#src/services/message/getMentions";
import { takeOne } from "#src/util/array/takeOne";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(getMentions, () => {
  test("empty string", () => {
    expect.hasAssertions();

    expect(getMentions("")).toHaveLength(0);
  });

  test("mention", () => {
    expect.hasAssertions();

    const id = v7();
    const mentions = getMentions(createMention(id));

    expect(mentions).toHaveLength(1);
    expect(takeOne(mentions).getAttribute(MENTION_ID_ATTRIBUTE)).toBe(id);
  });
});
