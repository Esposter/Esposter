import { createMention } from "#src/services/message/createMention.test";
import { getMentions } from "#src/services/message/mention/getMentions";
import { MENTION_ID_ATTRIBUTE, takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getMentions, () => {
  test("empty string", () => {
    expect.hasAssertions();

    expect(getMentions("")).toHaveLength(0);
  });

  test("mention", () => {
    expect.hasAssertions();

    const id = crypto.randomUUID();
    const mentions = getMentions(createMention(id));

    expect(mentions).toHaveLength(1);
    expect(takeOne(mentions).getAttribute(MENTION_ID_ATTRIBUTE)).toBe(id);
  });
});
